"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Mail, MailOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MessageItem {
	id: string;
	name: string;
	email: string;
	subject: string;
	body: string;
	isRead: boolean;
	createdAt: string;
}

interface MessagesListProps {
	initial: MessageItem[];
}

export function MessagesList({ initial }: MessagesListProps) {
	const router = useRouter();
	const [items, setItems] = useState<MessageItem[]>(initial);
	const [openId, setOpenId] = useState<string | null>(null);
	const [pendingId, setPendingId] = useState<string | null>(null);
	const [_isPending, startTransition] = useTransition();

	const toggleOpen = async (item: MessageItem) => {
		setOpenId((cur) => (cur === item.id ? null : item.id));
		// Auto-mark read on first open
		if (!item.isRead) {
			await fetch(`/api/admin/messages/${item.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ isRead: true }),
			}).catch(() => {});
			setItems((prev) => prev.map((m) => (m.id === item.id ? { ...m, isRead: true } : m)));
			startTransition(() => router.refresh());
		}
	};

	const handleToggleRead = async (id: string, current: boolean) => {
		setPendingId(id);
		try {
			await fetch(`/api/admin/messages/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ isRead: !current }),
			});
			setItems((prev) =>
				prev.map((m) => (m.id === id ? { ...m, isRead: !current } : m)),
			);
			startTransition(() => router.refresh());
		} finally {
			setPendingId(null);
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Bu mesajı silmek istediğine emin misin?")) return;
		setPendingId(id);
		try {
			await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
			setItems((prev) => prev.filter((m) => m.id !== id));
			startTransition(() => router.refresh());
		} finally {
			setPendingId(null);
		}
	};

	if (items.length === 0) {
		return (
			<Card>
				<CardContent className="p-12 text-center text-muted-foreground">
					Henüz mesaj yok.
				</CardContent>
			</Card>
		);
	}

	return (
		<ul className="space-y-3">
			{items.map((item) => {
				const open = openId === item.id;
				const pending = pendingId === item.id;
				const date = new Intl.DateTimeFormat("tr-TR", {
					dateStyle: "medium",
					timeStyle: "short",
				}).format(new Date(item.createdAt));

				return (
					<li key={item.id}>
						<Card
							className={cn(
								"transition-shadow",
								!item.isRead && "ring-1 ring-primary/30",
							)}
						>
							<button
								type="button"
								onClick={() => toggleOpen(item)}
								className="w-full text-left p-4 flex items-start gap-4 hover:bg-accent/40 transition-colors"
							>
								<div className="shrink-0 mt-0.5">
									{item.isRead ? (
										<MailOpen className="h-4 w-4 text-muted-foreground" />
									) : (
										<Mail className="h-4 w-4 text-primary" />
									)}
								</div>
								<div className="min-w-0 flex-1">
									<div className="flex items-center justify-between gap-3">
										<p
											className={cn(
												"truncate",
												!item.isRead ? "font-semibold" : "font-medium",
											)}
										>
											{item.name}{" "}
											<span className="text-muted-foreground font-normal">
												· {item.email}
											</span>
										</p>
										<p className="text-xs text-muted-foreground shrink-0">{date}</p>
									</div>
									{item.subject && (
										<p className="text-sm text-muted-foreground truncate mt-0.5">
											{item.subject}
										</p>
									)}
									<p
										className={cn(
											"text-sm text-muted-foreground mt-1",
											!open && "line-clamp-1",
										)}
									>
										{item.body}
									</p>
								</div>
								<ChevronDown
									className={cn(
										"h-4 w-4 text-muted-foreground shrink-0 transition-transform mt-1",
										open && "rotate-180",
									)}
								/>
							</button>
							{open && (
								<CardContent className="border-t p-4 space-y-3">
									<div className="text-sm whitespace-pre-wrap leading-relaxed">
										{item.body}
									</div>
									<div className="flex flex-wrap gap-2 pt-1">
										<Button asChild size="sm" variant="outline">
											<a href={`mailto:${item.email}?subject=Re: ${encodeURIComponent(item.subject || "Portfolio mesajınız")}`}>
												<Mail /> Yanıtla
											</a>
										</Button>
										<Button
											size="sm"
											variant="ghost"
											disabled={pending}
											onClick={() => handleToggleRead(item.id, item.isRead)}
										>
											{item.isRead ? <Mail /> : <Check />}
											{item.isRead ? "Okunmadı işaretle" : "Okundu işaretle"}
										</Button>
										<Button
											size="sm"
											variant="ghost"
											className="text-destructive hover:text-destructive"
											disabled={pending}
											onClick={() => handleDelete(item.id)}
										>
											<Trash2 /> Sil
										</Button>
									</div>
								</CardContent>
							)}
						</Card>
					</li>
				);
			})}
		</ul>
	);
}
