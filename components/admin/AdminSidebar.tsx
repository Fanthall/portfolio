"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	Briefcase,
	FolderKanban,
	LayoutDashboard,
	Mail,
	Menu,
	Search,
	UserCog,
	X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
	email: string;
	unreadCount: number;
}

const NAV_ITEMS = [
	{ href: "/admin", label: "Panel", icon: LayoutDashboard },
	{ href: "/admin/about", label: "Hakkımda", icon: UserCog },
	{ href: "/admin/career", label: "Kariyer", icon: Briefcase },
	{ href: "/admin/projects", label: "Projeler", icon: FolderKanban },
	{ href: "/admin/messages", label: "Mesajlar", icon: Mail, key: "messages" as const },
	{ href: "/admin/seo", label: "SEO", icon: Search },
] as const;

export function AdminSidebar({ email, unreadCount }: AdminSidebarProps) {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);

	useEffect(() => {
		setOpen(false);
	}, [pathname]);

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [open]);

	const isActive = (href: string) =>
		href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

	const navContent = (
		<>
			<div className="px-6 py-5 border-b">
				<Link href="/admin" className="block font-semibold tracking-tight">
					Admin
				</Link>
				<p className="text-xs text-muted-foreground mt-1 truncate">{email}</p>
			</div>
			<nav className="flex-1 p-3 space-y-1 overflow-y-auto">
				{NAV_ITEMS.map((item) => {
					const active = isActive(item.href);
					const badge = "key" in item && item.key === "messages" && unreadCount > 0 ? unreadCount : null;
					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm transition-colors",
								active
									? "bg-accent text-accent-foreground font-medium"
									: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
							)}
						>
							<span className="flex items-center gap-3">
								<item.icon className="h-4 w-4" />
								<span>{item.label}</span>
							</span>
							{badge !== null && (
								<span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
									{badge}
								</span>
							)}
						</Link>
					);
				})}
			</nav>
			<div className="p-3 border-t">
				<LogoutButton />
				<Link
					href="/"
					className="block mt-2 text-xs text-muted-foreground hover:text-foreground text-center"
				>
					← Siteye dön
				</Link>
			</div>
		</>
	);

	return (
		<>
			{/* Mobile topbar */}
			<div className="md:hidden sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card px-4">
				<Link href="/admin" className="font-semibold tracking-tight">
					Admin
				</Link>
				<Button
					size="icon"
					variant="ghost"
					aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
					onClick={() => setOpen((v) => !v)}
				>
					{open ? <X /> : <Menu />}
				</Button>
			</div>

			{/* Mobile drawer overlay */}
			{open && (
				<div
					className="md:hidden fixed inset-0 z-40 bg-black/40"
					onClick={() => setOpen(false)}
				/>
			)}

			{/* Sidebar — always fixed; main compensates with md:ml-60 */}
			<aside
				className={cn(
					"flex flex-col bg-card border-r",
					"fixed top-0 left-0 z-50 h-screen w-72 transition-transform",
					"md:w-60 md:translate-x-0",
					open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
				)}
			>
				{navContent}
			</aside>
		</>
	);
}
