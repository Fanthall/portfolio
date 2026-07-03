import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Pencil, Plus, Star } from "lucide-react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { mapProject } from "@/lib/data/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteProjectButton } from "@/components/admin/DeleteProjectButton";

export const metadata = { title: "Projeler — Admin" };

export default async function AdminProjectsPage() {
	const supabase = createSupabaseAdminClient();
	const { data } = await supabase
		.from("project")
		.select("*, project_image(id)")
		.order("order", { ascending: true })
		.order("created_at", { ascending: false });
	const projects = (data ?? []).map((row) => ({
		...mapProject(row),
		imageCount: Array.isArray(row.project_image) ? row.project_image.length : 0,
	}));

	return (
		<div className="p-8 max-w-5xl">
			<header className="mb-8 flex items-end justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Projeler</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Portfolio'da gösterilen projeleri yönet.
					</p>
				</div>
				<Button asChild>
					<Link href="/admin/projects/new">
						<Plus /> Yeni proje
					</Link>
				</Button>
			</header>

			{projects.length === 0 ? (
				<div className="text-center text-muted-foreground py-12 border border-dashed rounded-xl">
					Henüz proje eklenmemiş.
				</div>
			) : (
				<ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{projects.map((p) => (
						<li key={p.id}>
							<Card>
								<CardContent className="p-5 space-y-3">
									<div className="flex items-start gap-3">
										<div className="relative h-16 w-24 shrink-0 rounded-md overflow-hidden bg-muted">
											{p.coverImage && (
												<Image
													src={p.coverImage}
													alt={p.titleEn}
													fill
													className="object-cover"
												/>
											)}
										</div>
										<div className="min-w-0 flex-1">
											<div className="flex items-center gap-2 flex-wrap">
												<h3 className="font-semibold truncate">{p.titleTr}</h3>
												{p.isFeatured && (
													<span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
														<Star className="h-3 w-3 fill-amber-500" />
														Öne çıkan
													</span>
												)}
											</div>
											<p className="text-xs text-muted-foreground truncate">
												/{p.slug} · {p.demoType.toLowerCase().replace("_", " ")} ·{" "}
												{p.imageCount} görsel
											</p>
											<p className="text-sm text-muted-foreground line-clamp-2 mt-1">
												{p.summaryTr}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-2 pt-2 border-t">
										<Button size="sm" variant="outline" asChild>
											<Link href={`/admin/projects/${p.id}`}>
												<Pencil /> Düzenle
											</Link>
										</Button>
										<Button size="sm" variant="ghost" asChild>
											<Link href={`/projects/${p.slug}`} target="_blank">
												<ExternalLink /> Görüntüle
											</Link>
										</Button>
										<DeleteProjectButton id={p.id} title={p.titleTr} />
									</div>
								</CardContent>
							</Card>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
