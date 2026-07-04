import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileNav } from "@/components/MobileNav";
import { NavLinks } from "@/components/NavLinks";

interface HeaderProps {
	theme: "light" | "dark";
}

export async function Header({ theme }: HeaderProps) {
	const t = await getTranslations("header");
	const navItems = [
		{ href: "/", label: t("home") },
		{ href: "/about", label: t("about") },
		{ href: "/career", label: t("career") },
		{ href: "/projects", label: t("projects") },
		{ href: "/contact", label: t("contact") },
	];

	const logoSrc = theme === "dark" ? "/assets/darkLogo.png" : "/assets/lightLogo.png";

	return (
		<header className="si-header si">
			<div className="wrap topbar">
				<Link href="/" className="brand">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img className="logo" src={logoSrc} alt="Sezer Demir Dedek" width={34} height={34} />
					<span>Sezer Demir Dedek</span>
				</Link>
				<NavLinks items={navItems} />
				<div className="ctrls">
					<LanguageToggle />
					<ThemeToggle current={theme} />
					<MobileNav items={navItems} />
				</div>
			</div>
		</header>
	);
}
