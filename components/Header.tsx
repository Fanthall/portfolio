import { getTranslations } from "next-intl/server";
import Image from "next/image";
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
		<header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
				<Link
					href="/"
					className="flex items-center gap-3 transition-opacity hover:opacity-80"
				>
					<Image
						src={logoSrc}
						alt="Sezer Demir DEDEK"
						width={96}
						height={96}
						priority
						className="h-11 w-11 object-contain"
					/>
					<span className="hidden font-display text-base font-semibold tracking-tight sm:inline">
						Sezer Demir Dedek
					</span>
				</Link>
				<NavLinks items={navItems} />
				<div className="flex items-center gap-1">
					<LanguageToggle />
					<ThemeToggle current={theme} />
					<MobileNav items={navItems} />
				</div>
			</div>
		</header>
	);
}
