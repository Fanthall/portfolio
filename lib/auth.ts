import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Admin kimligi — Supabase Auth (JWT/bcrypt yerine). Public signup kapali
 * oldugundan (config.toml auth.enable_signup=false), kimligi dogrulanmis
 * herhangi bir kullanici = admin kabul edilir.
 */
export interface AdminUser {
	id: string;
	email: string;
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
	const supabase = await createSupabaseServerClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user || !user.email) return null;
	return { id: user.id, email: user.email };
}
