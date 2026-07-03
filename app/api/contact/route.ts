import { NextResponse } from "next/server";
import { z } from "zod";
import { createContactMessage } from "@/lib/data/queries";

const contactSchema = z.object({
	name: z.string().min(2).max(120),
	email: z.string().email().max(254),
	subject: z.string().max(200).optional(),
	body: z.string().min(5).max(5000),
});

export async function POST(request: Request) {
	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return NextResponse.json({ error: "invalid_json" }, { status: 400 });
	}

	const parsed = contactSchema.safeParse(payload);
	if (!parsed.success) {
		return NextResponse.json(
			{ error: "validation_error", details: parsed.error.flatten() },
			{ status: 400 },
		);
	}

	await createContactMessage({
		name: parsed.data.name,
		email: parsed.data.email,
		subject: parsed.data.subject ?? null,
		body: parsed.data.body,
	});

	return NextResponse.json({ ok: true }, { status: 201 });
}
