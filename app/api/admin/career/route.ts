import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

const createSchema = z.object({
	companyName: z.string().min(1).max(200),
	roleTr: z.string().min(1).max(200),
	roleEn: z.string().min(1).max(200),
	descTr: z.string().min(1).max(3000),
	descEn: z.string().min(1).max(3000),
	startDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
		message: "Invalid date",
	}),
	endDate: z
		.string()
		.refine((v) => !v || !Number.isNaN(Date.parse(v)), { message: "Invalid date" })
		.nullable()
		.optional(),
	order: z.number().int().min(0).max(1000).optional(),
});

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

	const created = await prisma.workExperience.create({
		data: {
			companyName: parsed.data.companyName.trim(),
			roleTr: parsed.data.roleTr.trim(),
			roleEn: parsed.data.roleEn.trim(),
			descTr: parsed.data.descTr.trim(),
			descEn: parsed.data.descEn.trim(),
			startDate: new Date(parsed.data.startDate),
			endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
			order: parsed.data.order ?? 0,
		},
	});

	revalidatePath("/", "layout");
	return NextResponse.json({ ok: true, experience: created }, { status: 201 });
}
