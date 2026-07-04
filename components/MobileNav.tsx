"use client";

import { Menu, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { useEffect, useState } from "react";

interface MobileNavProps {
	items: { href: string; label: string }[];
}

/** Prototip nav.main ≤900px'te gizleniyor; burada hamburger menü (mono link). */
export function MobileNav({ items }: MobileNavProps) {
	const [open, setOpen] = useState(false);
	const pathname = usePathname();

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
		document.addEventListener("keydown", onKey);
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = "";
		};
	}, [open]);

	return (
		<div className="hidden max-[900px]:block">
			<button
				type="button"
				className="iconbtn"
				aria-label={open ? "Close menu" : "Open menu"}
				onClick={() => setOpen((v) => !v)}
			>
				{open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
			</button>
			<div
				style={{
					position: "fixed",
					insetInline: 0,
					top: 64,
					zIndex: 49,
					background: "var(--bg)",
					borderBottom: "1px solid var(--line)",
					boxShadow: "var(--shadow)",
					transition: "opacity .2s, transform .2s",
					opacity: open ? 1 : 0,
					transform: open ? "translateY(0)" : "translateY(-8px)",
					pointerEvents: open ? "auto" : "none",
				}}
			>
				<nav className="wrap" style={{ display: "flex", flexDirection: "column", padding: "12px 24px" }}>
					{items.map((item) => {
						const active =
							item.href === "/"
								? pathname === "/"
								: pathname === item.href || pathname.startsWith(`${item.href}/`);
						return (
							<Link
								key={item.href}
								href={item.href}
								onClick={() => setOpen(false)}
								aria-current={active ? "page" : undefined}
								style={{
									fontFamily: '"JetBrains Mono", monospace',
									fontSize: "0.85rem",
									padding: "10px 0",
									color: active ? "var(--si-accent)" : "var(--ink)",
								}}
							>
								{item.label}
							</Link>
						);
					})}
				</nav>
			</div>
		</div>
	);
}
