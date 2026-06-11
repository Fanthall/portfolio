import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
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
				: Prisma.DbNull;

	const updated = await prisma.aboutContent.upsert({
		where: { id: 1 },
		create: {
			id: 1,
			siteTitle,
			siteDescription,
			titleTr: parsed.data.titleTr,
			titleEn: parsed.data.titleEn,
			bioTr: parsed.data.bioTr,
			bioEn: parsed.data.bioEn,
			photoUrl: parsed.data.photoUrl ?? null,
			socialLinks: cleanedSocials,
			skills,
		},
		update: {
			siteTitle,
			siteDescription,
			titleTr: parsed.data.titleTr,
			titleEn: parsed.data.titleEn,
			bioTr: parsed.data.bioTr,
			bioEn: parsed.data.bioEn,
			photoUrl: parsed.data.photoUrl ?? null,
			socialLinks: cleanedSocials,
			skills,
		},
	});

	revalidatePath("/", "layout");

	return NextResponse.json({ ok: true, about: updated });
}
