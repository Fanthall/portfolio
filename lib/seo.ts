import type { Metadata } from "next";
import type { PageKey } from "@prisma/client";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from "@/i18n/request";
import { getSiteUrl, PAGE_PATHS, type PageKeyValue } from "@/lib/site";

const LOCALE_COOKIE = "locale";

interface PageDefaults {
	titleTr: string;
	titleEn: string;
	descriptionTr: string;
	descriptionEn: string;
}

const PAGE_DEFAULTS: Record<PageKey, PageDefaults> = {
	HOME: {
		titleTr: "Anasayfa",
		titleEn: "Home",
		descriptionTr:
			"Sezer Demir DEDEK — Front-End odaklı yazılım mühendisi. Projeler, kariyer ve iletişim.",
		descriptionEn:
			"Sezer Demir DEDEK — Front-End focused software engineer. Projects, career and contact.",
	},
	ABOUT: {
		titleTr: "Hakkımda",
		titleEn: "About",
		descriptionTr: "Bilgisayar Mühendisliği mezunu, Front-End odaklı yazılım mühendisi.",
		descriptionEn: "Computer Engineering graduate, Front-End focused software engineer.",
	},
	CAREER: {
		titleTr: "Kariyerim",
		titleEn: "Career",
		descriptionTr: "Çalışma deneyimlerim ve kariyer yolculuğum.",
		descriptionEn: "My work experience and career journey.",
	},
	PROJECTS: {
		titleTr: "Projelerim",
		titleEn: "Projects",
		descriptionTr: "Geliştirdiğim öne çıkan projeler.",
		descriptionEn: "Featured projects I have built.",
	},
	CONTACT: {
		titleTr: "İletişim",
		titleEn: "Contact",
		descriptionTr: "Benimle iletişime geçebilirsin.",
		descriptionEn: "Get in touch with me.",
	},
};

async function getLocaleFromCookies(): Promise<Locale> {
	const store = await cookies();
	const value = store.get(LOCALE_COOKIE)?.value;
	if (value && (SUPPORTED_LOCALES as readonly string[]).includes(value)) {
		return value as Locale;
	}
	return DEFAULT_LOCALE;
}

interface GetPageMetadataOptions {
	canonicalPath?: string;
	ogImage?: string | null;
}

export async function getPageMetadata(
	pageKey: PageKey,
	options: GetPageMetadataOptions = {},
): Promise<Metadata> {
	const [locale, pageSeo, about] = await Promise.all([
		getLocaleFromCookies(),
		prisma.pageSeo.findUnique({ where: { pageKey } }),
		prisma.aboutContent.findUnique({ where: { id: 1 } }),
	]);

	const defaults = PAGE_DEFAULTS[pageKey];
	const title =
		(locale === "tr" ? pageSeo?.titleTr : pageSeo?.titleEn)?.trim() ||
		(locale === "tr" ? defaults.titleTr : defaults.titleEn);
	const description =
		(locale === "tr" ? pageSeo?.descriptionTr : pageSeo?.descriptionEn)?.trim() ||
		(locale === "tr" ? defaults.descriptionTr : defaults.descriptionEn) ||
		about?.siteDescription?.trim() ||
		"";
	const ogImage = pageSeo?.ogImage ?? options.ogImage ?? about?.photoUrl ?? null;

	const siteTitle = about?.siteTitle?.trim() || "Sezer Demir DEDEK";
	const base = getSiteUrl();
	const canonicalPath =
		options.canonicalPath ?? PAGE_PATHS[pageKey as PageKeyValue] ?? "/";
	const canonicalUrl = canonicalPath === "/" ? base : `${base}${canonicalPath}`;

	const ogImageAbsolute = ogImage
		? ogImage.startsWith("http")
			? ogImage
			: `${base}${ogImage}`
		: undefined;

	const noIndex = pageSeo?.noIndex === true;

	return {
		title,
		description,
		alternates: {
			canonical: canonicalUrl,
		},
		robots: noIndex
			? { index: false, follow: false, googleBot: { index: false, follow: false } }
			: {
					index: true,
					follow: true,
					googleBot: {
						index: true,
						follow: true,
						"max-snippet": -1,
						"max-image-preview": "large",
						"max-video-preview": -1,
					},
				},
		openGraph: {
			title: `${title} — ${siteTitle}`,
			description,
			url: canonicalUrl,
			siteName: siteTitle,
			locale: locale === "tr" ? "tr_TR" : "en_US",
			type: "website",
			images: ogImageAbsolute ? [{ url: ogImageAbsolute }] : undefined,
		},
		twitter: {
			card: "summary_large_image",
			title: `${title} — ${siteTitle}`,
			description,
			images: ogImageAbsolute ? [ogImageAbsolute] : undefined,
		},
	};
}
