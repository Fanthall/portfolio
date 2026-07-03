import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1).max(200),
});

export async function POST(request: Request) {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "invalid_json" }, { status: 400 });
	}

	const parsed = loginSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json({ error: "validation_error" }, { status: 400 });
	}

	const { email, password } = parsed.data;
	// Supabase Auth — signInWithPassword server client uzerinden cagrilinca
	// oturum cookie'leri otomatik yazilir (@supabase/ssr).
	const supabase = await createSupabaseServerClient();
	const { error } = await supabase.auth.signInWithPassword({ email, password });

	if (error) {
		return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
	}

	return NextResponse.json({ ok: true });
}
