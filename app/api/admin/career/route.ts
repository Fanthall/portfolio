import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentAdmin } from "@/lib/auth";

const createSchema = z.object({
	companyName: z.string().min(1).max(200),
	roleTr: z.string().min(1).max(200),
	roleEn: z.string().min(1).max(200),
	descTr: z.string().min(1).max(3000),
	descEn: z.string().min(1).max(3000),
	startDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
		message: "Invalid date",
	}),
	endDate: z
		.string()
		.refine((v) => !v || !Number.isNaN(Date.parse(v)), { message: "Invalid date" })
		.nullable()
		.optional(),
	order: z.number().int().min(0).max(1000).optional(),
});

export async function POST(request: Request) {
	const admin = await getCurrentAdmin();
	if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "invalid_json" }, { status: 400 });
	}

	const parsed = createSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{ error: "validation_error", details: parsed.error.flatten() },
			{ status: 400 },
		);
	}

	const toDate = (v: string) => new Date(v).toISOString().slice(0, 10);

	const supabase = createSupabaseAdminClient();
	const { data: created, error } = await supabase
		.from("work_experience")
		.insert({
			company_name: parsed.data.companyName.trim(),
			role_tr: parsed.data.roleTr.trim(),
			role_en: parsed.data.roleEn.trim(),
			desc_tr: parsed.data.descTr.trim(),
			desc_en: parsed.data.descEn.trim(),
			start_date: toDate(parsed.data.startDate),
			end_date: parsed.data.endDate ? toDate(parsed.data.endDate) : null,
			order: parsed.data.order ?? 0,
		})
		.select()
		.single();
	if (error) throw error;

	revalidatePath("/", "layout");
	return NextResponse.json({ ok: true, experience: created }, { status: 201 });
}
