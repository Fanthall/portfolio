/**
 * Local Supabase içeriğini cloud'a kopyalar (id/ilişkiler korunur).
 * Çalıştır: node --env-file=.env.cloud scripts/copy-local-to-cloud.mjs
 * Local = well-known dev demo key (gizli değil). Cloud = .env.cloud (service role).
 */
import { createClient } from "@supabase/supabase-js";

// Local demo key repoya GÖMÜLMEZ (evrensel demo key olsa da; secret tarayıcıları
// tetikliyor). `npx supabase status` çıktısından SERVICE_ROLE_KEY alıp env ile geç:
//   LOCAL_SUPABASE_SERVICE_KEY=$(npx supabase status -o env | grep SERVICE_ROLE_KEY | cut -d= -f2)
const LOCAL_URL = process.env.LOCAL_SUPABASE_URL ?? "http://127.0.0.1:54341";
const LOCAL_KEY = process.env.LOCAL_SUPABASE_SERVICE_KEY;
if (!LOCAL_KEY) {
	console.error(
		"✗ LOCAL_SUPABASE_SERVICE_KEY eksik. `npx supabase status` çıktısındaki SERVICE_ROLE_KEY'i env olarak geç.",
	);
	process.exit(1);
}

const local = createClient(LOCAL_URL, LOCAL_KEY, { auth: { persistSession: false } });
const cloud = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL,
	process.env.SUPABASE_SERVICE_ROLE_KEY,
	{ auth: { persistSession: false } },
);

// FK sırası: project → project_image
const TABLES = [
	{ name: "about_content", conflict: "id" },
	{ name: "work_experience", conflict: "id" },
	{ name: "project", conflict: "id" },
	{ name: "project_image", conflict: "id" },
	{ name: "page_seo", conflict: "id" },
];

for (const { name, conflict } of TABLES) {
	const { data, error } = await local.from(name).select("*");
	if (error) {
		console.log(`✗ ${name} local okuma: ${error.message}`);
		continue;
	}
	if (!data.length) {
		console.log(`· ${name}: 0 satır (atlandı)`);
		continue;
	}
	const { error: upErr } = await cloud.from(name).upsert(data, { onConflict: conflict });
	if (upErr) {
		console.log(`✗ ${name} cloud yazma: ${upErr.message}`);
		continue;
	}
	console.log(`✓ ${name}: ${data.length} satır kopyalandı`);
}
console.log("Kopya tamam.");
