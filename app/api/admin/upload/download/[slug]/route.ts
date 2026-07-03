import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import path from "node:path";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { BUCKETS, contentTypeFor } from "@/lib/supabase/storage";
import { getCurrentAdmin } from "@/lib/auth";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_BYTES = 150 * 1024 * 1024; // 150 MB

// Extension-based whitelist (.exe MIME is inconsistent across browsers)
const ALLOWED_EXT = new Set([
	".exe",
	".msi",
	".dmg",
	".pkg",
	".deb",
	".rpm",
	".appimage",
	".zip",
	".tar.gz",
	".tgz",
]);

interface RouteContext {
	params: Promise<{ slug: string }>;
}

function getExtension(filename: string): string {
	const lower = filename.toLowerCase();
	if (lower.endsWith(".tar.gz")) return ".tar.gz";
	return path.extname(lower);
}

/** downloads bucket'ta <slug>/ altındaki tüm nesneleri siler. */
async function clearSlugPrefix(
	supabase: ReturnType<typeof createSupabaseAdminClient>,
	slug: string,
) {
	const { data: list } = await supabase.storage.from(BUCKETS.downloads).list(slug);
	if (list && list.length > 0) {
		await supabase.storage
			.from(BUCKETS.downloads)
			.remove(list.map((f) => `${slug}/${f.name}`));
	}
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
	if (file.size > MAX_BYTES) {
		return NextResponse.json(
			{ error: "file_too_large", maxBytes: MAX_BYTES },
			{ status: 413 },
		);
	}

	const ext = getExtension(file.name);
	if (!ALLOWED_EXT.has(ext)) {
		return NextResponse.json({ error: "unsupported_extension", ext }, { status: 400 });
	}

	// Bu slug için önceki installer'ı temizle, sonra yükle.
	await clearSlugPrefix(supabase, slug);

	const objectPath = `${slug}/installer${ext}`;
	const buffer = Buffer.from(await file.arrayBuffer());
	const { error: upErr } = await supabase.storage
		.from(BUCKETS.downloads)
		.upload(objectPath, buffer, { contentType: contentTypeFor(ext), upsert: true });
	if (upErr) {
		return NextResponse.json({ error: "upload_failed", detail: upErr.message }, { status: 500 });
	}

	const {
		data: { publicUrl },
	} = supabase.storage.from(BUCKETS.downloads).getPublicUrl(objectPath);

	await supabase
		.from("project")
		.update({ download_url: publicUrl, demo_type: "DOWNLOAD_ONLY" })
		.eq("slug", slug);

	revalidatePath("/", "layout");

	return NextResponse.json({ ok: true, url: publicUrl, bytes: file.size, ext });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
	const admin = await getCurrentAdmin();
	if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

	const { slug } = await params;
	if (!SLUG_RE.test(slug)) {
		return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
	}

	const supabase = createSupabaseAdminClient();
	await clearSlugPrefix(supabase, slug);
	await supabase.from("project").update({ download_url: null }).eq("slug", slug);

	revalidatePath("/", "layout");
	return NextResponse.json({ ok: true });
}
