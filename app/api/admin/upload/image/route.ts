import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { BUCKETS } from "@/lib/supabase/storage";
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

	const supabase = createSupabaseAdminClient();
	const objectPath = `${randomUUID()}.${ext}`;
	const buffer = Buffer.from(await file.arrayBuffer());

	const { error } = await supabase.storage.from(BUCKETS.images).upload(objectPath, buffer, {
		contentType: file.type,
		upsert: false,
	});
	if (error) {
		return NextResponse.json({ error: "upload_failed", detail: error.message }, { status: 500 });
	}

	const {
		data: { publicUrl },
	} = supabase.storage.from(BUCKETS.images).getPublicUrl(objectPath);

	return NextResponse.json({ url: publicUrl });
}
