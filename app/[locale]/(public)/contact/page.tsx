import { getTranslations } from "next-intl/server";
import { Github, Instagram, Linkedin, Mail } from "lucide-react";
import Link from "next/link";
import { getAboutContent } from "@/lib/about";
import { ContactForm } from "@/components/ContactForm";
import { getPageMetadata } from "@/lib/seo";

export const generateMetadata = () => getPageMetadata("CONTACT");

interface SocialLinks {
	github?: string;
	linkedin?: string;
	instagram?: string;
	gmail?: string;
	outlook?: string;
}

export default async function ContactPage() {
	const t = await getTranslations();
	const about = await getAboutContent();
	const socials = (about?.socialLinks ?? {}) as SocialLinks;

	const directLinks = [
		socials.gmail && { href: `mailto:${socials.gmail}`, icon: Mail, label: socials.gmail },
		socials.github && { href: socials.github, icon: Github, label: "GitHub" },
		socials.linkedin && { href: socials.linkedin, icon: Linkedin, label: "LinkedIn" },
		socials.instagram && { href: socials.instagram, icon: Instagram, label: "Instagram" },
	].filter(Boolean) as { href: string; icon: typeof Mail; label: string }[];

	return (
		<div className="container mx-auto px-4 py-12 md:py-20 max-w-3xl animate-fade-in">
			<h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
				{t("header.contact")}
			</h1>
			<p className="text-muted-foreground mb-10">{t("contact.intro")}</p>

			<div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-10">
				<ContactForm />

				<aside className="space-y-2">
					<h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
						{t("contact.direct")}
					</h2>
					<ul className="space-y-2">
						{directLinks.map((link) => (
							<li key={link.label}>
								<Link
									href={link.href}
									target={link.href.startsWith("http") ? "_blank" : undefined}
									rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
									className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
								>
									<link.icon className="h-4 w-4" />
									<span className="truncate">{link.label}</span>
								</Link>
							</li>
						))}
					</ul>
				</aside>
			</div>
		</div>
	);
}
