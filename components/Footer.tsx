import { getTranslations } from "next-intl/server";
import NextLink from "next/link";
import { Github, Instagram, Linkedin, Mail } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getAboutContent } from "@/lib/about";

interface SocialLinks {
	github?: string;
	linkedin?: string;
	instagram?: string;
	gmail?: string;
}

export async function Footer() {
	const t = await getTranslations();
	const about = await getAboutContent();
	const socials = (about?.socialLinks ?? {}) as SocialLinks;
	const year = new Date().getFullYear();

	const navItems = [
		{ href: "/about", label: t("header.about") },
		{ href: "/career", label: t("header.career") },
		{ href: "/projects", label: t("header.projects") },
		{ href: "/contact", label: t("header.contact") },
	];

	const links = [
		socials.github && { href: socials.github, icon: Github, label: "GitHub" },
		socials.linkedin && { href: socials.linkedin, icon: Linkedin, label: "LinkedIn" },
		socials.instagram && { href: socials.instagram, icon: Instagram, label: "Instagram" },
		socials.gmail && { href: `mailto:${socials.gmail}`, icon: Mail, label: socials.gmail },
	].filter(Boolean) as { href: string; icon: typeof Github; label: string }[];

	return (
		<footer className="si-footer si">
			<div className="wrap foot">
				<span>{t("footer.copyright", { year })}</span>
				<nav style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
					{navItems.map((item) => (
						<Link key={item.href} href={item.href}>
							{item.label}
						</Link>
					))}
				</nav>
				<div className="socials">
					{links.map((link) => (
						<NextLink
							key={link.label}
							href={link.href}
							target={link.href.startsWith("http") ? "_blank" : undefined}
							rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
							aria-label={link.label}
						>
							<link.icon className="h-4 w-4" />
						</NextLink>
					))}
				</div>
			</div>
		</footer>
	);
}
