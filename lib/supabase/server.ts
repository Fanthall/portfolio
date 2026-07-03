import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

/**
 * Cookie-tabanli Supabase server client — RSC ve route handler'larda kullanilir.
 * Anon key + kullanici oturumu (varsa) ile RLS'e tabidir. Admin oturumu
 * cookie'de tasindigindan authenticated sorgular otomatik yetkilenir.
 */
export async function createSupabaseServerClient() {
	const cookieStore = await cookies();

	return createServerClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll();
				},
				setAll(cookiesToSet) {
					try {
						cookiesToSet.forEach(({ name, value, options }) =>
							cookieStore.set(name, value, options),
						);
					} catch {
						// RSC (read-only) context — setAll cagrilamaz; middleware token'i yeniler.
					}
				},
			},
		},
	);
}
