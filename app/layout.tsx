import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { cookies } from "next/headers";
import { getAboutContent } from "@/lib/about";
import Providers from "./providers";
import "./globals.css";

// Site içeriği DB'den çekildiği için statik prerender yapılmıyor — her istekte server'da render.
// Not: locale/theme cookie'den okunduğu sürece sayfalar zaten dynamic; ISR fırsatı
// path-based locale geçişiyle (redesign-2026 K3) birlikte ele alınacak.
export const dynamic = "force-dynamic";

const inter = Inter({
	subsets: ["latin", "latin-ext"],
	display: "swap",
});

const FALLBACK_TITLE = "Sezer Demir DEDEK";
const FALLBACK_DESCRIPTION = "Front-End focused software engineer — portfolio";

export async function generateMetadata(): Promise<Metadata> {
	const about = await getAboutContent();
	const siteTitle = about?.siteTitle?.trim() || FALLBACK_TITLE;
	const siteDescription = about?.siteDescription?.trim() || FALLBACK_DESCRIPTION;

	return {
		title: {
			default: siteTitle,
			template: `%s — ${siteTitle}`,
		},
		description: siteDescription,
		icons: {
			icon: [
				{
					url: "/logoLight/favicon-32x32.png",
					type: "image/png",
					sizes: "32x32",
					media: "(prefers-color-scheme: light)",
				},
				{
					url: "/logoLight/favicon-16x16.png",
					type: "image/png",
					sizes: "16x16",
					media: "(prefers-color-scheme: light)",
				},
				{
					url: "/logoDark/favicon-32x32.png",
					type: "image/png",
					sizes: "32x32",
					media: "(prefers-color-scheme: dark)",
				},
				{
					url: "/logoDark/favicon-16x16.png",
					type: "image/png",
					sizes: "16x16",
					media: "(prefers-color-scheme: dark)",
				},
			],
			apple: [
				{ url: "/logoLight/apple-touch-icon.png", media: "(prefers-color-scheme: light)" },
				{ url: "/logoDark/apple-touch-icon.png", media: "(prefers-color-scheme: dark)" },
			],
			shortcut: "/logoLight/favicon.ico",
		},
	};
}

const THEME_COOKIE = "theme";

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const locale = await getLocale();
	const messages = await getMessages();
	const cookieStore = await cookies();
	const theme = cookieStore.get(THEME_COOKIE)?.value === "light" ? "light" : "dark";

	return (
		<html
			lang={locale}
			className={theme === "dark" ? "dark" : ""}
			suppressHydrationWarning
		>
			<body className={inter.className}>
				<NextIntlClientProvider locale={locale} messages={messages}>
					<Providers>{children}</Providers>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
