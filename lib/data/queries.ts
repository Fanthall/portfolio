import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
	mapAbout,
	mapPageSeo,
	mapProject,
	mapProjectImage,
	mapWork,
	type AboutContent,
	type PageKey,
	type PageSeo,
	type Project,
	type ProjectWithImages,
	type WorkExperience,
} from "./types";

/**
 * Public okuma sorgulari — Supabase server client (anon + RLS). Yalniz
 * yayindaki icerik doner. Yazma islemleri admin katmanindadir (service role).
 */

/** AboutContent singleton (id=1). React cache() ile istek-ici tekillestirilir. */
export const getAboutContent = cache(async (): Promise<AboutContent | null> => {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase
		.from("about_content")
		.select("*")
		.eq("id", 1)
		.maybeSingle();
	if (error) throw error;
	return data ? mapAbout(data) : null;
});

export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase
		.from("project")
		.select("*")
		.eq("is_featured", true)
		.order("order", { ascending: true })
		.limit(limit);
	if (error) throw error;
	return (data ?? []).map(mapProject);
}

export async function getAllProjects(): Promise<Project[]> {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase
		.from("project")
		.select("*")
		.order("order", { ascending: true })
		.order("created_at", { ascending: false });
	if (error) throw error;
	return (data ?? []).map(mapProject);
}

export async function getProjectCount(): Promise<number> {
	const supabase = await createSupabaseServerClient();
	const { count, error } = await supabase
		.from("project")
		.select("*", { count: "exact", head: true });
	if (error) throw error;
	return count ?? 0;
}

export async function getProjectBySlug(
	slug: string,
): Promise<ProjectWithImages | null> {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase
		.from("project")
		.select("*, project_image(*)")
		.eq("slug", slug)
		.maybeSingle();
	if (error) throw error;
	if (!data) return null;

	const { project_image, ...projectRow } = data;
	const images = (project_image ?? [])
		.map(mapProjectImage)
		.sort((a, b) => a.order - b.order);
	return { ...mapProject(projectRow), images };
}

/** Sitemap icin hafif proje listesi. */
export async function getProjectSlugs(): Promise<
	{ slug: string; updatedAt: Date }[]
> {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase
		.from("project")
		.select("slug, updated_at");
	if (error) throw error;
	return (data ?? []).map((r) => ({
		slug: r.slug,
		updatedAt: new Date(r.updated_at),
	}));
}

export async function getWorkExperiences(): Promise<WorkExperience[]> {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase
		.from("work_experience")
		.select("*")
		.order("start_date", { ascending: false });
	if (error) throw error;
	return (data ?? []).map(mapWork);
}

export async function getPageSeo(pageKey: PageKey): Promise<PageSeo | null> {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase
		.from("page_seo")
		.select("*")
		.eq("page_key", pageKey)
		.maybeSingle();
	if (error) throw error;
	return data ? mapPageSeo(data) : null;
}

export async function getAllPageSeo(): Promise<PageSeo[]> {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase.from("page_seo").select("*");
	if (error) throw error;
	return (data ?? []).map(mapPageSeo);
}

/** Iletisim formu — public insert (RLS: anon insert izinli). */
export async function createContactMessage(input: {
	name: string;
	email: string;
	subject: string | null;
	body: string;
}): Promise<void> {
	const supabase = await createSupabaseServerClient();
	const { error } = await supabase.from("contact_message").insert({
		name: input.name,
		email: input.email,
		subject: input.subject,
		body: input.body,
	});
	if (error) throw error;
}
