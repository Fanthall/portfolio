import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db";
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

	const dir = path.join(process.cwd(), "public", "downloads", slug);
	// Replace any existing installer for this slug
	await rm(dir, { recursive: true, force: true });
	await mkdir(dir, { recursive: true });

	const safeName = `installer${ext}`;
	const buffer = Buffer.from(await file.arrayBuffer());
	await writeFile(path.join(dir, safeName), buffer);

	const url = `/downloads/${slug}/${safeName}`;
	await prisma.project.update({
		where: { slug },
		data: { downloadUrl: url, demoType: "DOWNLOAD_ONLY" },
	});

	revalidatePath("/", "layout");

	return NextResponse.json({ ok: true, url, bytes: file.size, ext });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
	const admin = await getCurrentAdmin();
	if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

	const { slug } = await params;
	if (!SLUG_RE.test(slug)) {
		return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
	}

	const dir = path.join(process.cwd(), "public", "downloads", slug);
	await rm(dir, { recursive: true, force: true });

	await prisma.project.update({
		where: { slug },
		data: { downloadUrl: null },
	});

	revalidatePath("/", "layout");
	return NextResponse.json({ ok: true });
}
