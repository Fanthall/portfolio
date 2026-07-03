import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { mapPageSeo } from "@/lib/data/types";
import { AdminSeoForm } from "@/components/admin/AdminSeoForm";

export const metadata = { title: "SEO — Admin" };

const PAGE_KEYS = ["HOME", "ABOUT", "CAREER", "PROJECTS", "CONTACT"] as const;

const PAGE_LABELS: Record<(typeof PAGE_KEYS)[number], { tr: string; path: string }> = {
	HOME: { tr: "Anasayfa", path: "/" },
	ABOUT: { tr: "Hakkımda", path: "/about" },
	CAREER: { tr: "Kariyerim", path: "/career" },
	PROJECTS: { tr: "Projelerim", path: "/projects" },
	CONTACT: { tr: "İletişim", path: "/contact" },
};

export default async function AdminSeoPage() {
	const supabase = createSupabaseAdminClient();
	const { data } = await supabase.from("page_seo").select("*");
	const rows = (data ?? []).map(mapPageSeo);
	const byKey = new Map(rows.map((r) => [r.pageKey, r]));

	const initial = PAGE_KEYS.map((key) => {
		const row = byKey.get(key);
		const label = PAGE_LABELS[key];
		return {
			pageKey: key,
			label: label.tr,
			path: label.path,
			titleTr: row?.titleTr ?? "",
			titleEn: row?.titleEn ?? "",
			descriptionTr: row?.descriptionTr ?? "",
			descriptionEn: row?.descriptionEn ?? "",
			ogImage: row?.ogImage ?? null,
			noIndex: row?.noIndex ?? false,
		};
	});

	return (
		<div className="p-8 max-w-3xl">
			<header className="mb-8">
				<h1 className="text-2xl font-bold tracking-tight">SEO</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Her sayfa için tarayıcı sekmesinde görünen başlık, meta description ve OG
					image (sosyal medya paylaşımı). Boş bırakılan alanlar genel site meta'sından
					düşer.
				</p>
			</header>

			<AdminSeoForm initial={initial} />
		</div>
	);
}
