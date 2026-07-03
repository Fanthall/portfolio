import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";
import { getCurrentAdmin } from "@/lib/auth";

type WorkUpdate = Database["public"]["Tables"]["work_experience"]["Update"];

const patchSchema = z.object({
	companyName: z.string().min(1).max(200).optional(),
	roleTr: z.string().min(1).max(200).optional(),
	roleEn: z.string().min(1).max(200).optional(),
	descTr: z.string().min(1).max(3000).optional(),
	descEn: z.string().min(1).max(3000).optional(),
	startDate: z
		.string()
		.refine((v) => !Number.isNaN(Date.parse(v)), { message: "Invalid date" })
		.optional(),
	endDate: z
		.string()
		.refine((v) => !v || !Number.isNaN(Date.parse(v)), { message: "Invalid date" })
		.nullable()
		.optional(),
	order: z.number().int().min(0).max(1000).optional(),
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
		return NextResponse.json(
			{ error: "validation_error", details: parsed.error.flatten() },
			{ status: 400 },
		);
	}

	const toDate = (v: string) => new Date(v).toISOString().slice(0, 10);
	const data: WorkUpdate = {};
	if (parsed.data.companyName !== undefined) data.company_name = parsed.data.companyName.trim();
	if (parsed.data.roleTr !== undefined) data.role_tr = parsed.data.roleTr.trim();
	if (parsed.data.roleEn !== undefined) data.role_en = parsed.data.roleEn.trim();
	if (parsed.data.descTr !== undefined) data.desc_tr = parsed.data.descTr.trim();
	if (parsed.data.descEn !== undefined) data.desc_en = parsed.data.descEn.trim();
	if (parsed.data.startDate !== undefined) data.start_date = toDate(parsed.data.startDate);
	if (parsed.data.endDate !== undefined) {
		data.end_date = parsed.data.endDate ? toDate(parsed.data.endDate) : null;
	}
	if (parsed.data.order !== undefined) data.order = parsed.data.order;

	const supabase = createSupabaseAdminClient();
	const { data: updated, error } = await supabase
		.from("work_experience")
		.update(data)
		.eq("id", id)
		.select()
		.maybeSingle();
	if (error || !updated) {
		return NextResponse.json({ error: "not_found" }, { status: 404 });
	}
	revalidatePath("/", "layout");
	return NextResponse.json({ ok: true, experience: updated });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
	const admin = await getCurrentAdmin();
	if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

	const { id } = await params;
	const supabase = createSupabaseAdminClient();
	const { data: deleted, error } = await supabase
		.from("work_experience")
		.delete()
		.eq("id", id)
		.select()
		.maybeSingle();
	if (error || !deleted) {
		return NextResponse.json({ error: "not_found" }, { status: 404 });
	}
	revalidatePath("/", "layout");
	return NextResponse.json({ ok: true });
}
