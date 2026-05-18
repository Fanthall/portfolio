import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import unzipper from "unzipper";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_ZIP_BYTES = 20 * 1024 * 1024; // 20 MB
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB per file

const ALLOWED_EXT = new Set([
	".html",
	".htm",
	".css",
	".js",
	".mjs",
	".json",
	".map",
	".png",
	".jpg",
	".jpeg",
	".webp",
	".gif",
	".svg",
	".ico",
	".woff",
	".woff2",
	".ttf",
	".otf",
	".eot",
	".txt",
	".xml",
	".mp4",
	".webm",
	".mp3",
	".ogg",
]);

interface RouteContext {
	params: Promise<{ slug: string }>;
}

function safeJoin(base: string, target: string): string | null {
	const resolved = path.resolve(base, target);
	const rel = path.relative(base, resolved);
	if (rel.startsWith("..") || path.isAbsolute(rel)) return null;
	return resolved;
}

export async function POST(request: Request, { params }: RouteContext) {
	const admin = await getCurrentAdmin();
	if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

	const { slug } = await params;
	if (!SLUG_RE.test(slug)) {
		return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
	}

	const project = await prisma.project.findUnique({ where: { slug } });
	if (!project) {
		return NextResponse.json({ error: "project_not_found" }, { status: 404 });
	}

	const formData = await request.formData();
	const file = formData.get("file");
	if (!(file instanceof File)) {
		return NextResponse.json({ error: "missing_file" }, { status: 400 });
	}
	if (file.size > MAX_ZIP_BYTES) {
		return NextResponse.json(
			{ error: "file_too_large", maxBytes: MAX_ZIP_BYTES },
			{ status: 413 },
		);
	}
	const filename = file.name.toLowerCase();
	if (!filename.endsWith(".zip")) {
		return NextResponse.json({ error: "not_a_zip" }, { status: 400 });
	}

	const baseDir = path.join(process.cwd(), "public", "demos", slug);

	// Clean previous demo for this slug
	await rm(baseDir, { recursive: true, force: true });
	await mkdir(baseDir, { recursive: true });

	const buffer = Buffer.from(await file.arrayBuffer());
	let directory;
	try {
		directory = await unzipper.Open.buffer(buffer);
	} catch {
		return NextResponse.json({ error: "invalid_zip" }, { status: 400 });
	}

	let entryPoint: string | null = null;
	let topLevelDir: string | null | "MULTI" = null;
	let totalBytes = 0;
	const writtenFiles: string[] = [];

	for (const entry of directory.files) {
		if (entry.type === "Directory") continue;

		// Path traversal guard
		const dest = safeJoin(baseDir, entry.path);
		if (!dest) {
			await rm(baseDir, { recursive: true, force: true });
			return NextResponse.json({ error: "path_traversal" }, { status: 400 });
		}

		// Extension whitelist
		const ext = path.extname(entry.path).toLowerCase();
		if (!ALLOWED_EXT.has(ext)) {
			await rm(baseDir, { recursive: true, force: true });
			return NextResponse.json(
				{ error: "unsupported_file", ext, path: entry.path },
				{ status: 400 },
			);
		}

		// Per-entry uncompressed size cap
		if (entry.uncompressedSize > MAX_FILE_BYTES) {
			await rm(baseDir, { recursive: true, force: true });
			return NextResponse.json(
				{ error: "entry_too_large", path: entry.path },
				{ status: 413 },
			);
		}
		totalBytes += entry.uncompressedSize;
		if (totalBytes > MAX_ZIP_BYTES) {
			await rm(baseDir, { recursive: true, force: true });
			return NextResponse.json({ error: "extracted_too_large" }, { status: 413 });
		}

		// Track top-level directory (so we can route the entry point)
		const segments = entry.path.split("/").filter(Boolean);
		if (segments.length > 0) {
			const first = segments[0];
			if (topLevelDir === null) topLevelDir = first;
			else if (topLevelDir !== "MULTI" && topLevelDir !== first) topLevelDir = "MULTI";
		}

		await mkdir(path.dirname(dest), { recursive: true });
		const content = await entry.buffer();
		await writeFile(dest, content);
		writtenFiles.push(entry.path);

		// Detect entry point
		const basename = path.basename(entry.path).toLowerCase();
		if (basename === "index.html") {
			if (!entryPoint || entry.path.split("/").length < entryPoint.split("/").length) {
				entryPoint = entry.path;
			}
		}
	}

	if (!entryPoint) {
		await rm(baseDir, { recursive: true, force: true });
		return NextResponse.json({ error: "no_index_html" }, { status: 400 });
	}

	const publicEntry = `/demos/${slug}/${entryPoint}`;

	await prisma.project.update({
		where: { slug },
		data: { demoFolder: publicEntry, demoType: "EMBEDDED_HTML" },
	});

	revalidatePath("/", "layout");

	return NextResponse.json({
		ok: true,
		entryPoint: publicEntry,
		fileCount: writtenFiles.length,
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

	const baseDir = path.join(process.cwd(), "public", "demos", slug);
	await rm(baseDir, { recursive: true, force: true });

	await prisma.project.update({
		where: { slug },
		data: { demoFolder: null },
	});

	revalidatePath("/", "layout");
	return NextResponse.json({ ok: true });
}
