import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";
import { getCurrentAdmin } from "@/lib/auth";

type ProjectUpdate = Database["public"]["Tables"]["project"]["Update"];

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
	tags: z.array(z.string().min(1).max(40)).max(12).optional(),
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

	const supabase = createSupabaseAdminClient();

	if (parsed.data.slug) {
		const { data: other } = await supabase
			.from("project")
			.select("id")
			.eq("slug", parsed.data.slug)
			.neq("id", id)
			.maybeSingle();
		if (other) return NextResponse.json({ error: "slug_taken" }, { status: 409 });
	}

	const data: ProjectUpdate = {};
	const d = parsed.data;
	if (d.slug !== undefined) data.slug = d.slug;
	if (d.titleTr !== undefined) data.title_tr = d.titleTr.trim();
	if (d.titleEn !== undefined) data.title_en = d.titleEn.trim();
	if (d.summaryTr !== undefined) data.summary_tr = d.summaryTr.trim();
	if (d.summaryEn !== undefined) data.summary_en = d.summaryEn.trim();
	if (d.descTr !== undefined) data.desc_tr = d.descTr.trim();
	if (d.descEn !== undefined) data.desc_en = d.descEn.trim();
	if (d.coverImage !== undefined) data.cover_image = emptyToNull(d.coverImage);
	if (d.demoType !== undefined) data.demo_type = d.demoType;
	if (d.demoUrl !== undefined) data.demo_url = emptyToNull(d.demoUrl);
	if (d.demoFolder !== undefined) data.demo_folder = emptyToNull(d.demoFolder);
	if (d.downloadUrl !== undefined) data.download_url = emptyToNull(d.downloadUrl);
	if (d.videoUrl !== undefined) data.video_url = emptyToNull(d.videoUrl);
	if (d.repoUrl !== undefined) data.repo_url = emptyToNull(d.repoUrl);
	if (d.tags !== undefined) data.tags = d.tags.map((t) => t.trim()).filter(Boolean);
	if (d.isFeatured !== undefined) data.is_featured = d.isFeatured;
	if (d.order !== undefined) data.order = d.order;

	const { data: updated, error } = await supabase
		.from("project")
		.update(data)
		.eq("id", id)
		.select()
		.maybeSingle();
	if (error || !updated) {
		return NextResponse.json({ error: "not_found" }, { status: 404 });
	}
	revalidatePath("/", "layout");
	return NextResponse.json({ ok: true, project: updated });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
	const admin = await getCurrentAdmin();
	if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

	const { id } = await params;
	const supabase = createSupabaseAdminClient();
	const { data: deleted, error } = await supabase
		.from("project")
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
