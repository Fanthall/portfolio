import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

interface RouteContext {
	params: Promise<{ id: string; imageId: string }>;
}

export async function DELETE(_request: Request, { params }: RouteContext) {
	const admin = await getCurrentAdmin();
	if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

	const { id, imageId } = await params;
	try {
		await prisma.projectImage.delete({ where: { id: imageId, projectId: id } });
		revalidatePath("/", "layout");
		return NextResponse.json({ ok: true });
	} catch {
		return NextResponse.json({ error: "not_found" }, { status: 404 });
	}
}
