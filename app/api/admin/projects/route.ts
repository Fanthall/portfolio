import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentAdmin } from "@/lib/auth";

const DEMO_TYPES = [
	"EXTERNAL_LINK",
	"EMBEDDED_HTML",
	"DOWNLOAD_ONLY",
	"VIDEO_ONLY",
	"GALLERY_ONLY",
] as const;

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const createSchema = z.object({
	slug: z.string().min(1).max(80).regex(slugRegex, {
		message: "Slug yalnız küçük harf, rakam ve tire içerebilir",
	}),
	titleTr: z.string().min(1).max(200),
	titleEn: z.string().min(1).max(200),
	summaryTr: z.string().min(1).max(500),
	summaryEn: z.string().min(1).max(500),
	descTr: z.string().min(1).max(5000),
	descEn: z.string().min(1).max(5000),
	coverImage: z.string().max(500).nullable().optional(),
	demoType: z.enum(DEMO_TYPES).default("GALLERY_ONLY"),
	demoUrl: z.string().max(500).nullable().optional(),
	demoFolder: z.string().max(500).nullable().optional(),
	downloadUrl: z.string().max(500).nullable().optional(),
	videoUrl: z.string().max(500).nullable().optional(),
	repoUrl: z.string().max(500).nullable().optional(),
	tags: z.array(z.string().min(1).max(40)).max(12).optional(),
	isFeatured: z.boolean().optional(),
	order: z.number().int().min(0).max(1000).optional(),
});

function emptyToNull(v: string | null | undefined) {
	if (!v) return null;
	const t = v.trim();
	return t.length > 0 ? t : null;
}

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

	const supabase = createSupabaseAdminClient();

	const { data: existing } = await supabase
		.from("project")
		.select("id")
		.eq("slug", parsed.data.slug)
		.maybeSingle();
	if (existing) {
		return NextResponse.json({ error: "slug_taken" }, { status: 409 });
	}

	const { data: created, error } = await supabase
		.from("project")
		.insert({
			slug: parsed.data.slug,
			title_tr: parsed.data.titleTr.trim(),
			title_en: parsed.data.titleEn.trim(),
			summary_tr: parsed.data.summaryTr.trim(),
			summary_en: parsed.data.summaryEn.trim(),
			desc_tr: parsed.data.descTr.trim(),
			desc_en: parsed.data.descEn.trim(),
			cover_image: emptyToNull(parsed.data.coverImage),
			demo_type: parsed.data.demoType,
			demo_url: emptyToNull(parsed.data.demoUrl),
			demo_folder: emptyToNull(parsed.data.demoFolder),
			download_url: emptyToNull(parsed.data.downloadUrl),
			video_url: emptyToNull(parsed.data.videoUrl),
			repo_url: emptyToNull(parsed.data.repoUrl),
			tags: (parsed.data.tags ?? []).map((t) => t.trim()).filter(Boolean),
			is_featured: parsed.data.isFeatured ?? false,
			order: parsed.data.order ?? 0,
		})
		.select()
		.single();
	if (error) throw error;

	revalidatePath("/", "layout");
	return NextResponse.json({ ok: true, project: created }, { status: 201 });
}
