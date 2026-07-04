import { getTranslations } from "next-intl/server";
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
}

export default async function ContactPage() {
	const t = await getTranslations();
	const about = await getAboutContent();
	const socials = (about?.socialLinks ?? {}) as SocialLinks;

	const channels = [
		socials.gmail && { label: t("contact.email"), href: `mailto:${socials.gmail}`, text: socials.gmail },
		socials.github && { label: "GitHub", href: socials.github, text: socials.github.replace(/^https?:\/\//, "") },
		socials.linkedin && {
			label: "LinkedIn",
			href: socials.linkedin,
			text: socials.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\//, ""),
		},
	].filter(Boolean) as { label: string; href: string; text: string }[];

	return (
		<div className="wrap page">
			<div className="page-head">
				<span className="eyebrow">{t("header.contact")}</span>
				<h1>{t("contact.heading")}</h1>
				<p>{t("contact.lead")}</p>
			</div>

			<div className="contact-grid">
				<div className="channels">
					{channels.map((c) => (
						<div className="channel" key={c.label}>
							<span className="cl">{c.label}</span>
							<Link
								href={c.href}
								target={c.href.startsWith("http") ? "_blank" : undefined}
								rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
							>
								{c.text}
							</Link>
						</div>
					))}
					<div className="channel">
						<span className="cl">{t("contact.statusLabel")}</span>
						<span className="val" style={{ color: "var(--si-muted)" }}>
							{t("contact.statusValue")}
						</span>
					</div>
				</div>

				<div>
					<ContactForm />
				</div>
			</div>
		</div>
	);
}
