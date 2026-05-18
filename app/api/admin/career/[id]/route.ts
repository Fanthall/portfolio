import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

const patchSchema = z.object({
	companyName: z.string().min(1).max(200).optional(),
	roleTr: z.string().min(1).max(200).optional(),
	roleEn: z.string().min(1).max(200).optional(),
	descTr: z.string().min(1).max(3000).optional(),
	descEn: z.string().min(1).max(3000).optional(),
	startDate: z
		.string()
		.refine((v) => !Number.isNaN(Date.parse(v)), { message: "Invalid date" })
		.optional(),
	endDate: z
		.string()
		.refine((v) => !v || !Number.isNaN(Date.parse(v)), { message: "Invalid date" })
		.nullable()
		.optional(),
	order: z.number().int().min(0).max(1000).optional(),
});

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

	const data: Record<string, unknown> = {};
	if (parsed.data.companyName !== undefined) data.companyName = parsed.data.companyName.trim();
	if (parsed.data.roleTr !== undefined) data.roleTr = parsed.data.roleTr.trim();
	if (parsed.data.roleEn !== undefined) data.roleEn = parsed.data.roleEn.trim();
	if (parsed.data.descTr !== undefined) data.descTr = parsed.data.descTr.trim();
	if (parsed.data.descEn !== undefined) data.descEn = parsed.data.descEn.trim();
	if (parsed.data.startDate !== undefined) data.startDate = new Date(parsed.data.startDate);
	if (parsed.data.endDate !== undefined) {
		data.endDate = parsed.data.endDate ? new Date(parsed.data.endDate) : null;
	}
	if (parsed.data.order !== undefined) data.order = parsed.data.order;

	try {
		const updated = await prisma.workExperience.update({ where: { id }, data });
		revalidatePath("/", "layout");
		return NextResponse.json({ ok: true, experience: updated });
	} catch {
		return NextResponse.json({ error: "not_found" }, { status: 404 });
	}
}

export async function DELETE(_request: Request, { params }: RouteContext) {
	const admin = await getCurrentAdmin();
	if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

	const { id } = await params;
	try {
		await prisma.workExperience.delete({ where: { id } });
		revalidatePath("/", "layout");
		return NextResponse.json({ ok: true });
	} catch {
		return NextResponse.json({ error: "not_found" }, { status: 404 });
	}
}
