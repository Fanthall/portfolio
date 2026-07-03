/**
 * Supabase bootstrap — idempotent.
 *   1) Admin Auth kullanicisi olusturur (Supabase Auth; bcrypt/JWT yerine).
 *   2) Storage bucket'larini olusturur (images / demos / downloads, public read).
 *
 * Calistir:  node --env-file=.env scripts/supabase-bootstrap.mjs
 * (npm run supabase:bootstrap)
 *
 * Not: SERVICE ROLE key kullanir — sadece local/CI/güvenli ortamda calistir.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL ?? "admin@portfolio.local";
const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD ?? "change-me-now";

if (!url || !serviceKey) {
	console.error("✗ NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY eksik (.env)");
	process.exit(1);
}

const supabase = createClient(url, serviceKey, {
	auth: { autoRefreshToken: false, persistSession: false },
});

async function ensureAdmin() {
	// Mevcut mu? (ilk sayfada arar — tek adminlik senaryo icin yeterli)
	const { data: list, error: listErr } = await supabase.auth.admin.listUsers();
	if (listErr) throw listErr;

	const existing = list.users.find((u) => u.email === adminEmail);
	if (existing) {
		console.log(`· Admin mevcut: ${adminEmail}`);
		return;
	}

	const { error } = await supabase.auth.admin.createUser({
		email: adminEmail,
		password: adminPassword,
		email_confirm: true,
		user_metadata: { role: "admin" },
	});
	if (error) throw error;
	console.log(`✓ Admin olusturuldu: ${adminEmail}`);
}

async function ensureBuckets() {
	const buckets = [
		{ name: process.env.SUPABASE_BUCKET_IMAGES ?? "images", fileSizeLimit: "5MB" },
		{ name: process.env.SUPABASE_BUCKET_DEMOS ?? "demos", fileSizeLimit: "20MB" },
		{ name: process.env.SUPABASE_BUCKET_DOWNLOADS ?? "downloads", fileSizeLimit: "150MB" },
	];

	const { data: current, error: listErr } = await supabase.storage.listBuckets();
	if (listErr) throw listErr;
	const have = new Set((current ?? []).map((b) => b.name));

	for (const b of buckets) {
		if (have.has(b.name)) {
			console.log(`· Bucket mevcut: ${b.name}`);
			continue;
		}
		const { error } = await supabase.storage.createBucket(b.name, {
			public: true,
			fileSizeLimit: b.fileSizeLimit,
		});
		if (error) throw error;
		console.log(`✓ Bucket olusturuldu: ${b.name} (public, <=${b.fileSizeLimit})`);
	}
}

async function main() {
	await ensureAdmin();
	await ensureBuckets();
	console.log("\nBootstrap tamam.");
	console.log(`Admin: ${adminEmail}`);
	console.log("Icerik: /admin panelinden yonetilir.");
}

main().catch((err) => {
	console.error("✗ Bootstrap hatasi:", err.message ?? err);
	process.exit(1);
});
