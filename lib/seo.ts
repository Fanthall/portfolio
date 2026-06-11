import type { Metadata } from "next";
import type { PageKey } from "@prisma/client";
import { getLocale } from "next-intl/server";
import { prisma } from "@/lib/db";
import { getAboutContent } from "@/lib/about";
import type { Locale } from "@/i18n/routing";
import {
	buildLanguageAlternates,
	getSiteUrl,
	localizeUrl,
	PAGE_PATHS,
	type PageKeyValue,
} from "@/lib/site";

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

interface GetPageMetadataOptions {
	canonicalPath?: string;
	ogImage?: string | null;
}

export async function getPageMetadata(
	pageKey: PageKey,
	options: GetPageMetadataOptions = {},
): Promise<Metadata> {
	const [locale, pageSeo, about] = await Promise.all([
		getLocale() as Promise<Locale>,
		prisma.pageSeo.findUnique({ where: { pageKey } }),
		getAboutContent(),
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
	// Öncelik: admin SEO override → çağıran sayfa → üretilmiş markalı görsel
	// (app/opengraph-image.tsx). Sayfa openGraph bloğu kök dosya-konvansiyonunu
	// ezdiği için fallback burada explicit verilir.
	const ogImage = pageSeo?.ogImage ?? options.ogImage ?? "/opengraph-image";

	const siteTitle = about?.siteTitle?.trim() || "Sezer Demir DEDEK";
	const base = getSiteUrl();
	const canonicalPath =
		options.canonicalPath ?? PAGE_PATHS[pageKey as PageKeyValue] ?? "/";
	// Canonical aktif dilin URL'i; hreflang her iki dil + x-default (TR)
	const canonicalUrl = localizeUrl(canonicalPath, locale);
	const languageAlternates = buildLanguageAlternates(canonicalPath);

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
			languages: languageAlternates,
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
			alternateLocale: locale === "tr" ? "en_US" : "tr_TR",
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
