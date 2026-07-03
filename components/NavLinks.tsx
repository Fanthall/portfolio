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
		<nav className="hidden items-center gap-6 md:flex">
			{items.map((item) => {
				const active = isActivePath(pathname, item.href);
				return (
					<Link
						key={item.href}
						href={item.href}
						aria-current={active ? "page" : undefined}
						className={cn(
							"relative py-1 font-mono text-[0.78rem] tracking-wide transition-colors",
							"after:absolute after:-bottom-0.5 after:left-0 after:h-[1.5px] after:w-full after:origin-left after:bg-primary after:transition-transform after:duration-200",
							active
								? "text-foreground after:scale-x-100"
								: "text-muted-foreground after:scale-x-0 hover:text-foreground hover:after:scale-x-100",
						)}
					>
						{item.label}
					</Link>
				);
			})}
		</nav>
	);
}
