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

const patchSchema = z.object({
	slug: z.string().min(1).max(80).regex(slugRegex).optional(),
	titleTr: z.string().min(1).max(200).optional(),
	titleEn: z.string().min(1).max(200).optional(),
	summaryTr: z.string().min(1).max(500).optional(),
	summaryEn: z.string().min(1).max(500).optional(),
	descTr: z.string().min(1).max(5000).optional(),
	descEn: z.string().min(1).max(5000).optional(),
	coverImage: z.string().max(500).nullable().optional(),
	demoType: z.enum(DEMO_TYPES).optional(),
	demoUrl: z.string().max(500).nullable().optional(),
	demoFolder: z.string().max(500).nullable().optional(),
	downloadUrl: z.string().max(500).nullable().optional(),
	videoUrl: z.string().max(500).nullable().optional(),
	repoUrl: z.string().max(500).nullable().optional(),
	isFeatured: z.boolean().optional(),
	order: z.number().int().min(0).max(1000).optional(),
});

function emptyToNull(v: string | null | undefined): string | null {
	if (v === undefined) return null;
	if (v === null) return null;
	const t = v.trim();
	return t.length > 0 ? t : null;
}

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

	if (parsed.data.slug) {
		const other = await prisma.project.findFirst({
			where: { slug: parsed.data.slug, NOT: { id } },
		});
		if (other) return NextResponse.json({ error: "slug_taken" }, { status: 409 });
	}

	const data: Record<string, unknown> = {};
	const d = parsed.data;
	if (d.slug !== undefined) data.slug = d.slug;
	if (d.titleTr !== undefined) data.titleTr = d.titleTr.trim();
	if (d.titleEn !== undefined) data.titleEn = d.titleEn.trim();
	if (d.summaryTr !== undefined) data.summaryTr = d.summaryTr.trim();
	if (d.summaryEn !== undefined) data.summaryEn = d.summaryEn.trim();
	if (d.descTr !== undefined) data.descTr = d.descTr.trim();
	if (d.descEn !== undefined) data.descEn = d.descEn.trim();
	if (d.coverImage !== undefined) data.coverImage = emptyToNull(d.coverImage);
	if (d.demoType !== undefined) data.demoType = d.demoType;
	if (d.demoUrl !== undefined) data.demoUrl = emptyToNull(d.demoUrl);
	if (d.demoFolder !== undefined) data.demoFolder = emptyToNull(d.demoFolder);
	if (d.downloadUrl !== undefined) data.downloadUrl = emptyToNull(d.downloadUrl);
	if (d.videoUrl !== undefined) data.videoUrl = emptyToNull(d.videoUrl);
	if (d.repoUrl !== undefined) data.repoUrl = emptyToNull(d.repoUrl);
	if (d.isFeatured !== undefined) data.isFeatured = d.isFeatured;
	if (d.order !== undefined) data.order = d.order;

	try {
		const updated = await prisma.project.update({ where: { id }, data });
		revalidatePath("/", "layout");
		return NextResponse.json({ ok: true, project: updated });
	} catch {
		return NextResponse.json({ error: "not_found" }, { status: 404 });
	}
}

export async function DELETE(_request: Request, { params }: RouteContext) {
	const admin = await getCurrentAdmin();
	if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

	const { id } = await params;
	try {
		await prisma.project.delete({ where: { id } });
		revalidatePath("/", "layout");
		return NextResponse.json({ ok: true });
	} catch {
		return NextResponse.json({ error: "not_found" }, { status: 404 });
	}
}
