import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Service-role Supabase client — SADECE sunucu tarafi. RLS'i bypass eder,
 * bu yuzden admin yazma islemleri (getCurrentAdmin dogrulamasindan SONRA)
 * ve tum admin okumalari (contact_message dahil) bununla yapilir.
 * Bu client'i asla client component'e import etme.
 */
export function createSupabaseAdminClient() {
	const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!serviceKey) {
		throw new Error("SUPABASE_SERVICE_ROLE_KEY tanimli degil (.env)");
	}

	return createClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		serviceKey,
		{ auth: { autoRefreshToken: false, persistSession: false } },
	);
}
