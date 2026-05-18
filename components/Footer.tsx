import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Github, Instagram, Linkedin, Mail } from "lucide-react";
import { prisma } from "@/lib/db";

interface SocialLinks {
	github?: string;
	linkedin?: string;
	instagram?: string;
	gmail?: string;
	outlook?: string;
}

export async function Footer() {
	const t = await getTranslations("footer");
	const about = await prisma.aboutContent.findUnique({ where: { id: 1 } });
	const socials = (about?.socialLinks ?? {}) as SocialLinks;
	const year = new Date().getFullYear();

	const links = [
		socials.github && { href: socials.github, icon: Github, label: "GitHub" },
		socials.linkedin && { href: socials.linkedin, icon: Linkedin, label: "LinkedIn" },
		socials.instagram && { href: socials.instagram, icon: Instagram, label: "Instagram" },
		socials.gmail && { href: `mailto:${socials.gmail}`, icon: Mail, label: socials.gmail },
	].filter(Boolean) as { href: string; icon: typeof Github; label: string }[];

	return (
		<footer className="border-t mt-16">
			<div className="container mx-auto flex flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between">
				<p className="text-sm text-muted-foreground">
					{t("copyright", { year })}
				</p>
				<div className="flex items-center gap-2">
					{links.map((link) => (
						<Link
							key={link.label}
							href={link.href}
							target={link.href.startsWith("http") ? "_blank" : undefined}
							rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
							aria-label={link.label}
							className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
						>
							<link.icon className="h-4 w-4" />
						</Link>
					))}
				</div>
			</div>
		</footer>
	);
}
