import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentAdmin } from "@/lib/auth";
import { skillsSchema } from "@/lib/skills";

const socialLinksSchema = z
	.object({
		github: z.string().url().optional().or(z.literal("")),
		linkedin: z.string().url().optional().or(z.literal("")),
		instagram: z.string().url().optional().or(z.literal("")),
		gmail: z.string().email().optional().or(z.literal("")),
	})
	.partial();

const aboutSchema = z.object({
	siteTitle: z.string().max(120).optional().or(z.literal("")),
	siteDescription: z.string().max(300).optional().or(z.literal("")),
	titleTr: z.string().min(1).max(200),
	titleEn: z.string().min(1).max(200),
	bioTr: z.string().min(1).max(5000),
	bioEn: z.string().min(1).max(5000),
	photoUrl: z.string().max(500).nullable().optional(),
	socialLinks: socialLinksSchema.optional(),
	skills: skillsSchema.nullable().optional(),
	roleTr: z.string().max(120).optional().or(z.literal("")),
	roleEn: z.string().max(120).optional().or(z.literal("")),
	taglineTr: z.string().max(400).optional().or(z.literal("")),
	taglineEn: z.string().max(400).optional().or(z.literal("")),
	projectsWorked: z.coerce.number().int().min(0).max(9999).nullable().optional(),
});

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

	const parsed = aboutSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{ error: "validation_error", details: parsed.error.flatten() },
			{ status: 400 },
		);
	}

	// Strip empty strings from socialLinks
	const cleanedSocials = parsed.data.socialLinks
		? Object.fromEntries(
				Object.entries(parsed.data.socialLinks).filter(([, v]) => v && v.length > 0),
			)
		: {};

	const siteTitle = parsed.data.siteTitle?.trim() || null;
	const siteDescription = parsed.data.siteDescription?.trim() || null;
	// undefined → alanı değiştirme; null/[] → temizle (default'a dön); dolu → kaydet
	const skills =
		parsed.data.skills === undefined
			? undefined
			: parsed.data.skills && parsed.data.skills.length > 0
				? parsed.data.skills
				: null;

	const record = {
		id: 1,
		site_title: siteTitle,
		site_description: siteDescription,
		title_tr: parsed.data.titleTr,
		title_en: parsed.data.titleEn,
		bio_tr: parsed.data.bioTr,
		bio_en: parsed.data.bioEn,
		photo_url: parsed.data.photoUrl ?? null,
		social_links: cleanedSocials,
		role_tr: parsed.data.roleTr?.trim() || null,
		role_en: parsed.data.roleEn?.trim() || null,
		tagline_tr: parsed.data.taglineTr?.trim() || null,
		tagline_en: parsed.data.taglineEn?.trim() || null,
		projects_worked: parsed.data.projectsWorked ?? null,
		// skills undefined ise alanı gönderme (mevcut değeri koru)
		...(skills === undefined ? {} : { skills }),
	};

	const supabase = createSupabaseAdminClient();
	const { data: updated, error } = await supabase
		.from("about_content")
		.upsert(record)
		.select()
		.single();
	if (error) throw error;

	revalidatePath("/", "layout");

	return NextResponse.json({ ok: true, about: updated });
}
