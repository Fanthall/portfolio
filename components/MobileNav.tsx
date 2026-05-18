"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileNavProps {
	items: { href: string; label: string }[];
}

export function MobileNav({ items }: MobileNavProps) {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [open]);

	return (
		<div className="md:hidden">
			<Button
				size="icon"
				variant="ghost"
				aria-label={open ? "Close menu" : "Open menu"}
				onClick={() => setOpen((v) => !v)}
			>
				{open ? <X /> : <Menu />}
			</Button>
			<div
				className={cn(
					"fixed inset-x-0 top-14 z-50 origin-top border-b bg-background shadow-lg transition-all duration-200",
					open
						? "opacity-100 translate-y-0"
						: "pointer-events-none opacity-0 -translate-y-2",
				)}
			>
				<nav className="container mx-auto flex flex-col gap-1 px-4 py-3">
					{items.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							onClick={() => setOpen(false)}
							className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
						>
							{item.label}
						</Link>
					))}
				</nav>
			</div>
		</div>
	);
}
