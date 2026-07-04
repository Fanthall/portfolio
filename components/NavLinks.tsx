"use client";

import { Link, usePathname } from "@/i18n/navigation";

interface NavLinksProps {
	items: { href: string; label: string }[];
}

function isActivePath(pathname: string, href: string) {
	if (href === "/") return pathname === "/";
	return pathname === href || pathname.startsWith(`${href}/`);
}

/** Prototip nav.main — mono link + accent altçizgi (aktif/hover). */
export function NavLinks({ items }: NavLinksProps) {
	const pathname = usePathname();

	return (
		<nav className="main">
			{items.map((item) => {
				const active = isActivePath(pathname, item.href);
				return (
					<Link
						key={item.href}
						href={item.href}
						aria-current={active ? "page" : undefined}
						className={active ? "active" : undefined}
					>
						{item.label}
					</Link>
				);
			})}
		</nav>
	);
}
