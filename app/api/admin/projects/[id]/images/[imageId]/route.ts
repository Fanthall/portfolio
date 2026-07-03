import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentAdmin } from "@/lib/auth";

interface RouteContext {
	params: Promise<{ id: string; imageId: string }>;
}

export async function DELETE(_request: Request, { params }: RouteContext) {
	const admin = await getCurrentAdmin();
	if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

	const { id, imageId } = await params;
	const supabase = createSupabaseAdminClient();
	const { data: deleted, error } = await supabase
		.from("project_image")
		.delete()
		.eq("id", imageId)
		.eq("project_id", id)
		.select()
		.maybeSingle();
	if (error || !deleted) {
		return NextResponse.json({ error: "not_found" }, { status: 404 });
	}
	revalidatePath("/", "layout");
	return NextResponse.json({ ok: true });
}
