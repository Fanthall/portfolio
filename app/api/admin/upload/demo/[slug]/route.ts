import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import path from "node:path";
import unzipper from "unzipper";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { BUCKETS, contentTypeFor } from "@/lib/supabase/storage";
import { getCurrentAdmin } from "@/lib/auth";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_ZIP_BYTES = 20 * 1024 * 1024; // 20 MB
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB per file

const ALLOWED_EXT = new Set([
	".html", ".htm", ".css", ".js", ".mjs", ".json", ".map",
	".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".ico",
	".woff", ".woff2", ".ttf", ".otf", ".eot",
	".txt", ".xml", ".mp4", ".webm", ".mp3", ".ogg",
]);

interface RouteContext {
	params: Promise<{ slug: string }>;
}

type AdminClient = ReturnType<typeof createSupabaseAdminClient>;

/** demos bucket'ta <prefix> altındaki tüm nesneleri (iç içe klasörler dahil) toplar. */
async function listAllPaths(supabase: AdminClient, prefix: string): Promise<string[]> {
	const { data } = await supabase.storage.from(BUCKETS.demos).list(prefix, { limit: 1000 });
	if (!data) return [];
	const paths: string[] = [];
	for (const entry of data) {
		const full = prefix ? `${prefix}/${entry.name}` : entry.name;
		// Klasörler metadata'sız döner → recurse; dosyalarda id/metadata dolu.
		if (entry.id === null) {
			paths.push(...(await listAllPaths(supabase, full)));
		} else {
			paths.push(full);
		}
	}
	return paths;
}

async function clearSlug(supabase: AdminClient, slug: string) {
	const paths = await listAllPaths(supabase, slug);
	if (paths.length > 0) await supabase.storage.from(BUCKETS.demos).remove(paths);
}

/** Zip entry yolu güvenlik kontrolü — traversal / absolute reddet. */
function isSafeEntryPath(p: string): boolean {
	if (p.startsWith("/") || p.includes("\\")) return false;
	return !p.split("/").some((seg) => seg === ".." || seg === ".");
}

export async function POST(request: Request, { params }: RouteContext) {
	const admin = await getCurrentAdmin();
	if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

	const { slug } = await params;
	if (!SLUG_RE.test(slug)) {
		return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
	}

	const supabase = createSupabaseAdminClient();
	const { data: project } = await supabase
		.from("project")
		.select("id")
		.eq("slug", slug)
		.maybeSingle();
	if (!project) {
		return NextResponse.json({ error: "project_not_found" }, { status: 404 });
	}

	const formData = await request.formData();
	const file = formData.get("file");
	if (!(file instanceof File)) {
		return NextResponse.json({ error: "missing_file" }, { status: 400 });
	}
	if (file.size > MAX_ZIP_BYTES) {
		return NextResponse.json({ error: "file_too_large", maxBytes: MAX_ZIP_BYTES }, { status: 413 });
	}
	if (!file.name.toLowerCase().endsWith(".zip")) {
		return NextResponse.json({ error: "not_a_zip" }, { status: 400 });
	}

	const buffer = Buffer.from(await file.arrayBuffer());
	let directory;
	try {
		directory = await unzipper.Open.buffer(buffer);
	} catch {
		return NextResponse.json({ error: "invalid_zip" }, { status: 400 });
	}

	// Önce doğrula (traversal/ext/boyut), sonra yükle — kısmi yüklemeyi önlemek için.
	const files: { entryPath: string; content: Buffer }[] = [];
	let entryPoint: string | null = null;
	let totalBytes = 0;

	for (const entry of directory.files) {
		if (entry.type === "Directory") continue;

		if (!isSafeEntryPath(entry.path)) {
			return NextResponse.json({ error: "path_traversal", path: entry.path }, { status: 400 });
		}
		const ext = path.extname(entry.path).toLowerCase();
		if (!ALLOWED_EXT.has(ext)) {
			return NextResponse.json({ error: "unsupported_file", ext, path: entry.path }, { status: 400 });
		}
		if (entry.uncompressedSize > MAX_FILE_BYTES) {
			return NextResponse.json({ error: "entry_too_large", path: entry.path }, { status: 413 });
		}
		totalBytes += entry.uncompressedSize;
		if (totalBytes > MAX_ZIP_BYTES) {
			return NextResponse.json({ error: "extracted_too_large" }, { status: 413 });
		}

		const content = await entry.buffer();
		files.push({ entryPath: entry.path, content });

		const basename = path.basename(entry.path).toLowerCase();
		if (basename === "index.html") {
			if (!entryPoint || entry.path.split("/").length < entryPoint.split("/").length) {
				entryPoint = entry.path;
			}
		}
	}

	if (!entryPoint) {
		return NextResponse.json({ error: "no_index_html" }, { status: 400 });
	}

	// Önceki demoyu temizle, sonra hepsini yükle.
	await clearSlug(supabase, slug);

	for (const f of files) {
		const objectPath = `${slug}/${f.entryPath}`;
		const ext = path.extname(f.entryPath).toLowerCase();
		const { error } = await supabase.storage
			.from(BUCKETS.demos)
			.upload(objectPath, f.content, { contentType: contentTypeFor(ext), upsert: true });
		if (error) {
			await clearSlug(supabase, slug); // kısmi yüklemeyi geri al
			return NextResponse.json({ error: "upload_failed", detail: error.message }, { status: 500 });
		}
	}

	const {
		data: { publicUrl },
	} = supabase.storage.from(BUCKETS.demos).getPublicUrl(`${slug}/${entryPoint}`);

	await supabase
		.from("project")
		.update({ demo_folder: publicUrl, demo_type: "EMBEDDED_HTML" })
		.eq("slug", slug);

	revalidatePath("/", "layout");

	return NextResponse.json({
		ok: true,
		entryPoint: publicUrl,
		fileCount: files.length,
		bytes: totalBytes,
	});
}

export async function DELETE(_request: Request, { params }: RouteContext) {
	const admin = await getCurrentAdmin();
	if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

	const { slug } = await params;
	if (!SLUG_RE.test(slug)) {
		return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
	}

	const supabase = createSupabaseAdminClient();
	await clearSlug(supabase, slug);
	await supabase.from("project").update({ demo_folder: null }).eq("slug", slug);

	revalidatePath("/", "layout");
	return NextResponse.json({ ok: true });
}
