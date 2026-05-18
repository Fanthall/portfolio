import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileNav } from "@/components/MobileNav";

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
					className="flex items-center gap-3 font-semibold tracking-tight hover:opacity-80 transition-opacity"
				>
					<Image
						src={logoSrc}
						alt="Sezer Demir DEDEK"
						width={96}
						height={96}
						priority
						className="h-12 w-12 object-contain"
					/>
					<span className="text-base hidden sm:inline">Sezer Demir DEDEK</span>
				</Link>
				<nav className="hidden md:flex items-center gap-1">
					{navItems.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
						>
							{item.label}
						</Link>
					))}
				</nav>
				<div className="flex items-center gap-1">
					<LanguageToggle />
					<ThemeToggle current={theme} />
					<MobileNav items={navItems} />
				</div>
			</div>
		</header>
	);
}
