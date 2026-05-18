import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { setSessionCookie, signSession } from "@/lib/auth";

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8).max(200),
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
	const admin = await prisma.adminUser.findUnique({ where: { email } });
	if (!admin) {
		return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
	}

	const ok = await bcrypt.compare(password, admin.passwordHash);
	if (!ok) {
		return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
	}

	const token = signSession({ sub: admin.id, email: admin.email });
	await setSessionCookie(token);

	return NextResponse.json({ ok: true });
}
