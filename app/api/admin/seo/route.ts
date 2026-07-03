import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentAdmin } from "@/lib/auth";

const PAGE_KEYS = ["HOME", "ABOUT", "CAREER", "PROJECTS", "CONTACT"] as const;

const itemSchema = z.object({
	pageKey: z.enum(PAGE_KEYS),
	titleTr: z.string().max(200).optional().or(z.literal("")),
	titleEn: z.string().max(200).optional().or(z.literal("")),
	descriptionTr: z.string().max(400).optional().or(z.literal("")),
	descriptionEn: z.string().max(400).optional().or(z.literal("")),
	ogImage: z.string().max(500).nullable().optional(),
	noIndex: z.boolean().optional(),
});

const bodySchema = z.object({
	pages: z.array(itemSchema).min(1).max(20),
});

function nullable(value: string | undefined | null) {
	if (!value) return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

export async function PUT(request: Request) {
	const admin = await getCurrentAdmin();
	if (!admin) {
		return NextResponse.json({ error: "unauthorized" }, { status: 401 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "invalid_json" }, { status: 400 });
	}

	const parsed = bodySchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{ error: "validation_error", details: parsed.error.flatten() },
			{ status: 400 },
		);
	}

	const records = parsed.data.pages.map((page) => ({
		page_key: page.pageKey,
		title_tr: nullable(page.titleTr),
		title_en: nullable(page.titleEn),
		description_tr: nullable(page.descriptionTr),
		description_en: nullable(page.descriptionEn),
		og_image: nullable(page.ogImage ?? null),
		no_index: page.noIndex ?? false,
	}));

	const supabase = createSupabaseAdminClient();
	const { error } = await supabase
		.from("page_seo")
		.upsert(records, { onConflict: "page_key" });
	if (error) throw error;

	revalidatePath("/", "layout");

	return NextResponse.json({ ok: true });
}
