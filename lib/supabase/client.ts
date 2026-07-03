import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

/**
 * Tarayici Supabase client — client component'lerde (admin login: signInWithPassword)
 * kullanilir. Oturum @supabase/ssr ile cookie'ye yazilir; middleware yeniler.
 */
export function createSupabaseBrowserClient() {
	return createBrowserClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
	);
}
