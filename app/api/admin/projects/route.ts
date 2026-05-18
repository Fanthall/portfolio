import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
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

	const existing = await prisma.project.findUnique({ where: { slug: parsed.data.slug } });
	if (existing) {
		return NextResponse.json({ error: "slug_taken" }, { status: 409 });
	}

	const created = await prisma.project.create({
		data: {
			slug: parsed.data.slug,
			titleTr: parsed.data.titleTr.trim(),
			titleEn: parsed.data.titleEn.trim(),
			summaryTr: parsed.data.summaryTr.trim(),
			summaryEn: parsed.data.summaryEn.trim(),
			descTr: parsed.data.descTr.trim(),
			descEn: parsed.data.descEn.trim(),
			coverImage: emptyToNull(parsed.data.coverImage),
			demoType: parsed.data.demoType,
			demoUrl: emptyToNull(parsed.data.demoUrl),
			demoFolder: emptyToNull(parsed.data.demoFolder),
			downloadUrl: emptyToNull(parsed.data.downloadUrl),
			videoUrl: emptyToNull(parsed.data.videoUrl),
			repoUrl: emptyToNull(parsed.data.repoUrl),
			isFeatured: parsed.data.isFeatured ?? false,
			order: parsed.data.order ?? 0,
		},
	});

	revalidatePath("/", "layout");
	return NextResponse.json({ ok: true, project: created }, { status: 201 });
}
