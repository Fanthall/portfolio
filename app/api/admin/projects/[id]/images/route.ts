import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentAdmin } from "@/lib/auth";

const createSchema = z.object({
	url: z.string().min(1).max(500),
	altTr: z.string().max(200).nullable().optional(),
	altEn: z.string().max(200).nullable().optional(),
});

interface RouteContext {
	params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteContext) {
	const admin = await getCurrentAdmin();
	if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

	const { id } = await params;
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "invalid_json" }, { status: 400 });
	}

	const parsed = createSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json({ error: "validation_error" }, { status: 400 });
	}

	const supabase = createSupabaseAdminClient();

	const { data: project } = await supabase
		.from("project")
		.select("id")
		.eq("id", id)
		.maybeSingle();
	if (!project) return NextResponse.json({ error: "project_not_found" }, { status: 404 });

	const { count: imageCount } = await supabase
		.from("project_image")
		.select("*", { count: "exact", head: true })
		.eq("project_id", id);

	const { data: image, error } = await supabase
		.from("project_image")
		.insert({
			project_id: id,
			url: parsed.data.url,
			alt_tr: parsed.data.altTr ?? null,
			alt_en: parsed.data.altEn ?? null,
			order: imageCount ?? 0,
		})
		.select()
		.single();
	if (error) throw error;

	revalidatePath("/", "layout");
	return NextResponse.json({ ok: true, image }, { status: 201 });
}
