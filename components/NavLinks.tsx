"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface NavLinksProps {
	items: { href: string; label: string }[];
}

function isActivePath(pathname: string, href: string) {
	if (href === "/") return pathname === "/";
	return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks({ items }: NavLinksProps) {
	const pathname = usePathname();

	return (
		<nav className="hidden md:flex items-center gap-1">
			{items.map((item) => {
				const active = isActivePath(pathname, item.href);
				return (
					<Link
						key={item.href}
						href={item.href}
						aria-current={active ? "page" : undefined}
						className={cn(
							"rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
							active
								? "bg-accent text-accent-foreground"
								: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
						)}
					>
						{item.label}
					</Link>
				);
			})}
		</nav>
	);
}
