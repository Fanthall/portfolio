import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

const patchSchema = z.object({
	isRead: z.boolean(),
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
		return NextResponse.json({ error: "validation_error" }, { status: 400 });
	}

	try {
		const updated = await prisma.contactMessage.update({
			where: { id },
			data: { isRead: parsed.data.isRead },
		});
		return NextResponse.json({ ok: true, message: updated });
	} catch {
		return NextResponse.json({ error: "not_found" }, { status: 404 });
	}
}

export async function DELETE(_request: Request, { params }: RouteContext) {
	const admin = await getCurrentAdmin();
	if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

	const { id } = await params;
	try {
		await prisma.contactMessage.delete({ where: { id } });
		return NextResponse.json({ ok: true });
	} catch {
		return NextResponse.json({ error: "not_found" }, { status: 404 });
	}
}
