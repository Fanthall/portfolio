import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
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

	await prisma.$transaction(
		parsed.data.pages.map((page) =>
			prisma.pageSeo.upsert({
				where: { pageKey: page.pageKey },
				create: {
					pageKey: page.pageKey,
					titleTr: nullable(page.titleTr),
					titleEn: nullable(page.titleEn),
					descriptionTr: nullable(page.descriptionTr),
					descriptionEn: nullable(page.descriptionEn),
					ogImage: nullable(page.ogImage ?? null),
					noIndex: page.noIndex ?? false,
				},
				update: {
					titleTr: nullable(page.titleTr),
					titleEn: nullable(page.titleEn),
					descriptionTr: nullable(page.descriptionTr),
					descriptionEn: nullable(page.descriptionEn),
					ogImage: nullable(page.ogImage ?? null),
					noIndex: page.noIndex ?? false,
				},
			}),
		),
	);

	revalidatePath("/", "layout");

	return NextResponse.json({ ok: true });
}
