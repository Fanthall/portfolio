/**
 * Local Supabase içeriğini cloud'a kopyalar (id/ilişkiler korunur).
 * Çalıştır: node --env-file=.env.cloud scripts/copy-local-to-cloud.mjs
 * Local = well-known dev demo key (gizli değil). Cloud = .env.cloud (service role).
 */
import { createClient } from "@supabase/supabase-js";

const LOCAL_URL = "http://127.0.0.1:54341";
const LOCAL_KEY =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

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
