import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { getCurrentAdmin } from "@/lib/auth";

const ALLOWED_MIME = new Map<string, string>([
	["image/png", "png"],
	["image/jpeg", "jpg"],
	["image/webp", "webp"],
	["image/gif", "gif"],
	["image/svg+xml", "svg"],
]);

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
	const admin = await getCurrentAdmin();
	if (!admin) {
		return NextResponse.json({ error: "unauthorized" }, { status: 401 });
	}

	const formData = await request.formData();
	const file = formData.get("file");
	if (!(file instanceof File)) {
		return NextResponse.json({ error: "missing_file" }, { status: 400 });
	}

	const ext = ALLOWED_MIME.get(file.type);
	if (!ext) {
		return NextResponse.json({ error: "unsupported_mime", type: file.type }, { status: 400 });
	}

	if (file.size > MAX_SIZE) {
		return NextResponse.json({ error: "file_too_large", maxBytes: MAX_SIZE }, { status: 413 });
	}

	const uploadsDir = path.join(process.cwd(), "public", "uploads");
	await mkdir(uploadsDir, { recursive: true });

	const filename = `${randomUUID()}.${ext}`;
	const buffer = Buffer.from(await file.arrayBuffer());
	await writeFile(path.join(uploadsDir, filename), buffer);

	const url = `/uploads/${filename}`;
	return NextResponse.json({ url });
}
