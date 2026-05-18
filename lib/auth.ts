import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";

const COOKIE_NAME = "admin_session";

interface SessionPayload {
	sub: string;
	email: string;
	iat?: number;
	exp?: number;
}

function getSecret(): string {
	const secret = process.env.JWT_SECRET;
	if (!secret || secret.length < 16) {
		throw new Error("JWT_SECRET is missing or too short");
	}
	return secret;
}

function getTtlSeconds(): number {
	const raw = process.env.JWT_TTL_SECONDS;
	const parsed = raw ? Number(raw) : NaN;
	return Number.isFinite(parsed) && parsed > 0 ? parsed : 60 * 60 * 12;
}

export function signSession(payload: { sub: string; email: string }): string {
	return jwt.sign(payload, getSecret(), { expiresIn: getTtlSeconds() });
}

export function verifySession(token: string): SessionPayload | null {
	try {
		return jwt.verify(token, getSecret()) as SessionPayload;
	} catch {
		return null;
	}
}

export async function setSessionCookie(token: string) {
	const store = await cookies();
	store.set(COOKIE_NAME, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: getTtlSeconds(),
	});
}

export async function clearSessionCookie() {
	const store = await cookies();
	store.delete(COOKIE_NAME);
}

export async function getCurrentAdmin() {
	const store = await cookies();
	const token = store.get(COOKIE_NAME)?.value;
	if (!token) return null;
	const payload = verifySession(token);
	if (!payload) return null;
	const admin = await prisma.adminUser.findUnique({ where: { id: payload.sub } });
	return admin;
}

export const ADMIN_SESSION_COOKIE = COOKIE_NAME;
