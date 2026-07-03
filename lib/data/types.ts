/**
 * Domain tipleri — DB snake_case satirlarindan map edilen camelCase sekiller.
 * (Eskiden @prisma/client'tan gelen tiplerin yerini alir; component'ler ayni
 * alan adlariyla calismaya devam eder.)
 */
import type { Database } from "@/lib/supabase/database.types";

export type DemoType =
	| "EXTERNAL_LINK"
	| "EMBEDDED_HTML"
	| "DOWNLOAD_ONLY"
	| "VIDEO_ONLY"
	| "GALLERY_ONLY";

export type PageKey = "HOME" | "ABOUT" | "CAREER" | "PROJECTS" | "CONTACT";

export interface SocialLinks {
	github?: string;
	linkedin?: string;
	instagram?: string;
	gmail?: string;
	[key: string]: string | undefined;
}

export interface AboutContent {
	id: number;
	titleTr: string;
	titleEn: string;
	bioTr: string;
	bioEn: string;
	photoUrl: string | null;
	socialLinks: SocialLinks;
	skills: unknown;
	siteTitle: string | null;
	siteDescription: string | null;
	// CMS alanlari (null iken i18n/kod fallback)
	roleTr: string | null;
	roleEn: string | null;
	taglineTr: string | null;
	taglineEn: string | null;
	projectsWorked: number | null;
	updatedAt: Date;
}

export interface WorkExperience {
	id: string;
	companyName: string;
	roleTr: string;
	roleEn: string;
	descTr: string;
	descEn: string;
	startDate: Date;
	endDate: Date | null;
	order: number;
}

export interface ProjectImage {
	id: string;
	projectId: string;
	url: string;
	altTr: string | null;
	altEn: string | null;
	order: number;
}

export interface Project {
	id: string;
	slug: string;
	titleTr: string;
	titleEn: string;
	summaryTr: string;
	summaryEn: string;
	descTr: string;
	descEn: string;
	coverImage: string | null;
	demoType: DemoType;
	demoUrl: string | null;
	demoFolder: string | null;
	downloadUrl: string | null;
	videoUrl: string | null;
	repoUrl: string | null;
	tags: string[];
	isFeatured: boolean;
	order: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface ProjectWithImages extends Project {
	images: ProjectImage[];
}

export interface ContactMessage {
	id: string;
	name: string;
	email: string;
	subject: string | null;
	body: string;
	isRead: boolean;
	createdAt: Date;
}

export interface PageSeo {
	id: string;
	pageKey: PageKey;
	titleTr: string | null;
	titleEn: string | null;
	descriptionTr: string | null;
	descriptionEn: string | null;
	ogImage: string | null;
	noIndex: boolean;
	updatedAt: Date;
}

// ── Row → domain mappers ────────────────────────────────────────────────
type Tables = Database["public"]["Tables"];
type AboutRow = Tables["about_content"]["Row"];
type WorkRow = Tables["work_experience"]["Row"];
type ProjectRow = Tables["project"]["Row"];
type ProjectImageRow = Tables["project_image"]["Row"];
type ContactRow = Tables["contact_message"]["Row"];
type PageSeoRow = Tables["page_seo"]["Row"];

export function mapAbout(r: AboutRow): AboutContent {
	return {
		id: r.id,
		titleTr: r.title_tr,
		titleEn: r.title_en,
		bioTr: r.bio_tr,
		bioEn: r.bio_en,
		photoUrl: r.photo_url,
		socialLinks: (r.social_links ?? {}) as SocialLinks,
		skills: r.skills,
		siteTitle: r.site_title,
		siteDescription: r.site_description,
		roleTr: r.role_tr,
		roleEn: r.role_en,
		taglineTr: r.tagline_tr,
		taglineEn: r.tagline_en,
		projectsWorked: r.projects_worked,
		updatedAt: new Date(r.updated_at),
	};
}

export function mapWork(r: WorkRow): WorkExperience {
	return {
		id: r.id,
		companyName: r.company_name,
		roleTr: r.role_tr,
		roleEn: r.role_en,
		descTr: r.desc_tr,
		descEn: r.desc_en,
		startDate: new Date(r.start_date),
		endDate: r.end_date ? new Date(r.end_date) : null,
		order: r.order,
	};
}

export function mapProject(r: ProjectRow): Project {
	return {
		id: r.id,
		slug: r.slug,
		titleTr: r.title_tr,
		titleEn: r.title_en,
		summaryTr: r.summary_tr,
		summaryEn: r.summary_en,
		descTr: r.desc_tr,
		descEn: r.desc_en,
		coverImage: r.cover_image,
		demoType: r.demo_type as DemoType,
		demoUrl: r.demo_url,
		demoFolder: r.demo_folder,
		downloadUrl: r.download_url,
		videoUrl: r.video_url,
		repoUrl: r.repo_url,
		tags: r.tags ?? [],
		isFeatured: r.is_featured,
		order: r.order,
		createdAt: new Date(r.created_at),
		updatedAt: new Date(r.updated_at),
	};
}

export function mapProjectImage(r: ProjectImageRow): ProjectImage {
	return {
		id: r.id,
		projectId: r.project_id,
		url: r.url,
		altTr: r.alt_tr,
		altEn: r.alt_en,
		order: r.order,
	};
}

export function mapContact(r: ContactRow): ContactMessage {
	return {
		id: r.id,
		name: r.name,
		email: r.email,
		subject: r.subject,
		body: r.body,
		isRead: r.is_read,
		createdAt: new Date(r.created_at),
	};
}

export function mapPageSeo(r: PageSeoRow): PageSeo {
	return {
		id: r.id,
		pageKey: r.page_key as PageKey,
		titleTr: r.title_tr,
		titleEn: r.title_en,
		descriptionTr: r.description_tr,
		descriptionEn: r.description_en,
		ogImage: r.og_image,
		noIndex: r.no_index,
		updatedAt: new Date(r.updated_at),
	};
}
