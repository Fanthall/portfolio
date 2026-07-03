import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentAdmin } from "@/lib/auth";

const patchSchema = z.object({
	isRead: z.boolean(),
});

interface RouteContext {
	params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteContext) {
	const admin = await getCurrentAdmin();
	if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

	const { id } = await params;
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "invalid_json" }, { status: 400 });
	}

	const parsed = patchSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json({ error: "validation_error" }, { status: 400 });
	}

	const supabase = createSupabaseAdminClient();
	const { data: updated, error } = await supabase
		.from("contact_message")
		.update({ is_read: parsed.data.isRead })
		.eq("id", id)
		.select()
		.maybeSingle();
	if (error || !updated) {
		return NextResponse.json({ error: "not_found" }, { status: 404 });
	}
	return NextResponse.json({ ok: true, message: updated });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
	const admin = await getCurrentAdmin();
	if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

	const { id } = await params;
	const supabase = createSupabaseAdminClient();
	const { data: deleted, error } = await supabase
		.from("contact_message")
		.delete()
		.eq("id", id)
		.select()
		.maybeSingle();
	if (error || !deleted) {
		return NextResponse.json({ error: "not_found" }, { status: 404 });
	}
	return NextResponse.json({ ok: true });
}
