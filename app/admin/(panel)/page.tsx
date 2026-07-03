import Image from "next/image";
import Link from "next/link";
import {
	ArrowUpRight,
	Briefcase,
	ExternalLink,
	FolderKanban,
	Mail,
	MailOpen,
	Plus,
	Search,
	Star,
	UserCog,
} from "lucide-react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { mapAbout, mapWork } from "@/lib/data/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSiteUrl } from "@/lib/site";

export const metadata = { title: "Admin Panel" };

export default async function AdminDashboardPage() {
	const supabase = createSupabaseAdminClient();

	const [
		aboutRes,
		projectsRes,
		featuredProjectsRes,
		experiencesRes,
		activeExperiencesRes,
		messagesRes,
		unreadMessagesRes,
		latestMessagesRes,
		seoRes,
		recentProjectsRes,
		activeJobRes,
	] = await Promise.all([
		supabase.from("about_content").select("*").eq("id", 1).maybeSingle(),
		supabase.from("project").select("*", { count: "exact", head: true }),
		supabase
			.from("project")
			.select("*", { count: "exact", head: true })
			.eq("is_featured", true),
		supabase.from("work_experience").select("*", { count: "exact", head: true }),
		supabase
			.from("work_experience")
			.select("*", { count: "exact", head: true })
			.is("end_date", null),
		supabase.from("contact_message").select("*", { count: "exact", head: true }),
		supabase
			.from("contact_message")
			.select("*", { count: "exact", head: true })
			.eq("is_read", false),
		supabase
			.from("contact_message")
			.select("*")
			.order("is_read", { ascending: true })
			.order("created_at", { ascending: false })
			.limit(4),
		supabase
			.from("page_seo")
			.select("*", { count: "exact", head: true })
			.or(
				"title_tr.not.is.null,title_en.not.is.null,description_tr.not.is.null,description_en.not.is.null,og_image.not.is.null,no_index.is.true",
			),
		supabase
			.from("project")
			.select("id, slug, title_tr, cover_image, is_featured")
			.order("updated_at", { ascending: false })
			.limit(3),
		supabase
			.from("work_experience")
			.select("*")
			.is("end_date", null)
			.order("start_date", { ascending: false })
			.limit(1)
			.maybeSingle(),
	]);

	const about = aboutRes.data ? mapAbout(aboutRes.data) : null;
	const projects = projectsRes.count ?? 0;
	const featuredProjectsCount = featuredProjectsRes.count ?? 0;
	const experiences = experiencesRes.count ?? 0;
	const activeExperiencesCount = activeExperiencesRes.count ?? 0;
	const messages = messagesRes.count ?? 0;
	const unreadMessagesCount = unreadMessagesRes.count ?? 0;
	const latestMessages = (latestMessagesRes.data ?? []).map((m) => ({
		id: m.id,
		name: m.name,
		subject: m.subject,
		body: m.body,
		isRead: m.is_read,
		createdAt: new Date(m.created_at),
	}));
	const seoCustomCount = seoRes.count ?? 0;
	const recentProjects = (recentProjectsRes.data ?? []).map((p) => ({
		id: p.id,
		slug: p.slug,
		titleTr: p.title_tr,
		coverImage: p.cover_image,
		isFeatured: p.is_featured,
	}));
	const activeJob = activeJobRes.data ? mapWork(activeJobRes.data) : null;

	const siteUrl = getSiteUrl();
	const siteTitle = about?.siteTitle?.trim() || "Sezer Demir DEDEK";

	const stats = [
		{
			label: "Projeler",
			value: projects,
			meta: featuredProjectsCount > 0 ? `${featuredProjectsCount} öne çıkan` : "—",
			href: "/admin/projects",
			icon: FolderKanban,
		},
		{
			label: "Kariyer",
			value: experiences,
			meta: activeExperiencesCount > 0 ? `${activeExperiencesCount} aktif` : "—",
			href: "/admin/career",
			icon: Briefcase,
		},
		{
			label: "Mesajlar",
			value: messages,
			meta: unreadMessagesCount > 0 ? `${unreadMessagesCount} okunmamış` : "tümü okundu",
			href: "/admin/messages",
			icon: Mail,
			alert: unreadMessagesCount > 0,
		},
		{
			label: "Özel SEO",
			value: `${seoCustomCount}/5`,
			meta: "sayfada override",
			href: "/admin/seo",
			icon: Search,
		},
	];

	const quickActions = [
		{ label: "Yeni proje", href: "/admin/projects/new", icon: Plus },
		{ label: "Yeni deneyim", href: "/admin/career", icon: Briefcase },
		{ label: "Hakkımda düzenle", href: "/admin/about", icon: UserCog },
		{ label: "SEO ayarları", href: "/admin/seo", icon: Search },
	];

	const formatDate = (d: Date) =>
		new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(d);

	return (
		<div className="p-8 max-w-6xl space-y-8">
			{/* Hero */}
			<section className="rounded-2xl border bg-card overflow-hidden">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6">
					<div className="flex items-center gap-4 min-w-0">
						{about?.photoUrl && (
							<div className="relative h-14 w-14 shrink-0 rounded-full overflow-hidden ring-2 ring-border">
								<Image src={about.photoUrl} alt={siteTitle} fill className="object-cover" />
							</div>
						)}
						<div className="min-w-0">
							<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
								Hoş geldin
							</p>
							<h1 className="text-2xl font-bold tracking-tight truncate">{siteTitle}</h1>
							<p className="text-xs text-muted-foreground mt-0.5 truncate">{siteUrl}</p>
						</div>
					</div>
					<div className="flex gap-2 shrink-0">
						<Button asChild variant="outline">
							<Link href="/" target="_blank" rel="noopener noreferrer">
								<ExternalLink /> Siteyi görüntüle
							</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* Active job spotlight */}
			{activeJob && (
				<section>
					<Card className="ring-1 ring-emerald-500/40 bg-gradient-to-br from-emerald-500/5 to-transparent">
						<CardContent className="p-5 flex flex-wrap items-center gap-4">
							<div className="flex items-center gap-3 min-w-0">
								<div className="relative flex h-3 w-3">
									<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
									<span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
								</div>
								<div className="min-w-0">
									<p className="text-[10px] uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 font-semibold">
										Aktif iş
									</p>
									<p className="font-semibold truncate">
										{activeJob.roleTr} ·{" "}
										<span className="text-muted-foreground font-normal">
											{activeJob.companyName.split(" — ")[0]}
										</span>
									</p>
								</div>
							</div>
							<Button asChild size="sm" variant="ghost" className="ml-auto">
								<Link href="/admin/career">
									Yönet <ArrowUpRight />
								</Link>
							</Button>
						</CardContent>
					</Card>
				</section>
			)}

			{/* Stat grid */}
			<section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				{stats.map((s) => (
					<Link key={s.label} href={s.href}>
						<Card className="hover:shadow-md transition-shadow h-full">
							<CardContent className="p-5">
								<div className="flex items-start justify-between">
									<p className="text-xs uppercase tracking-wider text-muted-foreground">
										{s.label}
									</p>
									<s.icon
										className={
											s.alert
												? "h-4 w-4 text-primary"
												: "h-4 w-4 text-muted-foreground"
										}
									/>
								</div>
								<p className="text-3xl font-bold mt-3">{s.value}</p>
								<p className="text-xs text-muted-foreground mt-1">{s.meta}</p>
							</CardContent>
						</Card>
					</Link>
				))}
			</section>

			{/* 2-column grid: latest messages + quick actions */}
			<section className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
				{/* Latest messages */}
				<Card>
					<CardContent className="p-5">
						<div className="flex items-center justify-between mb-4">
							<h2 className="font-semibold">Son mesajlar</h2>
							<Button asChild variant="ghost" size="sm">
								<Link href="/admin/messages">
									Tümü <ArrowUpRight />
								</Link>
							</Button>
						</div>

						{latestMessages.length === 0 ? (
							<p className="text-sm text-muted-foreground py-6 text-center">
								Henüz mesaj yok.
							</p>
						) : (
							<ul className="space-y-1">
								{latestMessages.map((m) => (
									<li key={m.id}>
										<Link
											href="/admin/messages"
											className="flex items-start gap-3 rounded-md p-2 hover:bg-accent transition-colors"
										>
											<div className="shrink-0 mt-0.5">
												{m.isRead ? (
													<MailOpen className="h-4 w-4 text-muted-foreground" />
												) : (
													<Mail className="h-4 w-4 text-primary" />
												)}
											</div>
											<div className="min-w-0 flex-1">
												<div className="flex items-center justify-between gap-2">
													<p
														className={
															m.isRead
																? "text-sm truncate"
																: "text-sm font-semibold truncate"
														}
													>
														{m.name}
													</p>
													<p className="text-[11px] text-muted-foreground shrink-0">
														{formatDate(m.createdAt)}
													</p>
												</div>
												<p className="text-xs text-muted-foreground truncate">
													{m.subject || m.body}
												</p>
											</div>
										</Link>
									</li>
								))}
							</ul>
						)}
					</CardContent>
				</Card>

				{/* Quick actions */}
				<Card>
					<CardContent className="p-5">
						<h2 className="font-semibold mb-4">Hızlı işlemler</h2>
						<ul className="space-y-1">
							{quickActions.map((a) => (
								<li key={a.href}>
									<Link
										href={a.href}
										className="flex items-center gap-2 rounded-md p-2 text-sm hover:bg-accent transition-colors"
									>
										<a.icon className="h-4 w-4 text-muted-foreground" />
										<span>{a.label}</span>
										<ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
									</Link>
								</li>
							))}
						</ul>
					</CardContent>
				</Card>
			</section>

			{/* Recent projects */}
			{recentProjects.length > 0 && (
				<section>
					<Card>
						<CardContent className="p-5">
							<div className="flex items-center justify-between mb-4">
								<h2 className="font-semibold">Son güncellenen projeler</h2>
								<Button asChild variant="ghost" size="sm">
									<Link href="/admin/projects">
										Tümü <ArrowUpRight />
									</Link>
								</Button>
							</div>
							<ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
								{recentProjects.map((p) => (
									<li key={p.id}>
										<Link
											href={`/admin/projects/${p.id}`}
											className="flex items-center gap-3 rounded-md border p-3 hover:bg-accent transition-colors"
										>
											<div className="relative h-12 w-16 shrink-0 rounded overflow-hidden bg-muted">
												{p.coverImage && (
													<Image
														src={p.coverImage}
														alt={p.titleTr}
														fill
														className="object-cover"
													/>
												)}
											</div>
											<div className="min-w-0 flex-1">
												<div className="flex items-center gap-1.5">
													<p className="text-sm font-medium truncate">{p.titleTr}</p>
													{p.isFeatured && (
														<Star className="h-3 w-3 fill-amber-500 text-amber-500 shrink-0" />
													)}
												</div>
												<p className="text-xs text-muted-foreground truncate">/{p.slug}</p>
											</div>
										</Link>
									</li>
								))}
							</ul>
						</CardContent>
					</Card>
				</section>
			)}
		</div>
	);
}
