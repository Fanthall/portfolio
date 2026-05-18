import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
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

	const project = await prisma.project.findUnique({
		where: { id },
		include: { _count: { select: { images: true } } },
	});
	if (!project) return NextResponse.json({ error: "project_not_found" }, { status: 404 });

	const image = await prisma.projectImage.create({
		data: {
			projectId: id,
			url: parsed.data.url,
			altTr: parsed.data.altTr ?? null,
			altEn: parsed.data.altEn ?? null,
			order: project._count.images,
		},
	});

	revalidatePath("/", "layout");
	return NextResponse.json({ ok: true, image }, { status: 201 });
}
