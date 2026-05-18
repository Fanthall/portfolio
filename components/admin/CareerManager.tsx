"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface CareerItem {
	id: string;
	companyName: string;
	roleTr: string;
	roleEn: string;
	descTr: string;
	descEn: string;
	startDate: string;
	endDate: string;
	order: number;
}

type Draft = Omit<CareerItem, "id"> & { id?: string };

interface CareerManagerProps {
	initial: CareerItem[];
}

const emptyDraft = (): Draft => ({
	companyName: "",
	roleTr: "",
	roleEn: "",
	descTr: "",
	descEn: "",
	startDate: "",
	endDate: "",
	order: 0,
});

export function CareerManager({ initial }: CareerManagerProps) {
	const router = useRouter();
	const [items, setItems] = useState<CareerItem[]>(initial);
	const [draft, setDraft] = useState<Draft | null>(null);
	const [pending, setPending] = useState(false);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [_isPending, startTransition] = useTransition();

	const startNew = () => {
		setDraft(emptyDraft());
		setErrorMsg(null);
	};

	const startEdit = (item: CareerItem) => {
		setDraft({ ...item });
		setErrorMsg(null);
	};

	const closeDraft = () => {
		setDraft(null);
		setErrorMsg(null);
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Bu deneyimi silmek istediğine emin misin?")) return;
		setPending(true);
		try {
			const res = await fetch(`/api/admin/career/${id}`, { method: "DELETE" });
			if (res.ok) {
				setItems((prev) => prev.filter((i) => i.id !== id));
				startTransition(() => router.refresh());
			}
		} finally {
			setPending(false);
		}
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!draft) return;

		if (!draft.companyName.trim() || !draft.roleTr.trim() || !draft.roleEn.trim() || !draft.startDate) {
			setErrorMsg("Şirket, rol ve başlangıç tarihi zorunlu.");
			return;
		}

		setPending(true);
		setErrorMsg(null);

		const payload = {
			companyName: draft.companyName.trim(),
			roleTr: draft.roleTr.trim(),
			roleEn: draft.roleEn.trim(),
			descTr: draft.descTr.trim() || "—",
			descEn: draft.descEn.trim() || "—",
			startDate: draft.startDate,
			endDate: draft.endDate ? draft.endDate : null,
			order: Number(draft.order) || 0,
		};

		try {
			const isEdit = !!draft.id;
			const res = await fetch(
				isEdit ? `/api/admin/career/${draft.id}` : "/api/admin/career",
				{
					method: isEdit ? "PATCH" : "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				},
			);
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setErrorMsg(
					data?.error === "validation_error"
						? "Form alanlarını kontrol et."
						: "Kaydetme başarısız.",
				);
				return;
			}
			const { experience } = (await res.json()) as { experience: { id: string; startDate: string; endDate: string | null } };
			const next: CareerItem = {
				id: experience.id,
				companyName: payload.companyName,
				roleTr: payload.roleTr,
				roleEn: payload.roleEn,
				descTr: payload.descTr,
				descEn: payload.descEn,
				startDate: payload.startDate,
				endDate: payload.endDate ?? "",
				order: payload.order,
			};
			setItems((prev) => {
				if (isEdit) return prev.map((i) => (i.id === next.id ? next : i));
				return [...prev, next].sort((a, b) =>
					a.order !== b.order
						? a.order - b.order
						: new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
				);
			});
			closeDraft();
			startTransition(() => router.refresh());
		} catch {
			setErrorMsg("Bağlantı hatası.");
		} finally {
			setPending(false);
		}
	};

	const updateDraft = (patch: Partial<Draft>) =>
		setDraft((cur) => (cur ? { ...cur, ...patch } : cur));

	return (
		<div className="space-y-4">
			<div className="flex justify-end">
				<Button size="sm" onClick={startNew} disabled={!!draft || pending}>
					<Plus /> Yeni deneyim
				</Button>
			</div>

			{draft && (
				<Card className="ring-2 ring-primary/40">
					<CardContent className="p-6">
						<div className="flex items-center justify-between mb-4">
							<h2 className="font-semibold">
								{draft.id ? "Deneyimi düzenle" : "Yeni deneyim"}
							</h2>
							<Button size="icon" variant="ghost" onClick={closeDraft} disabled={pending}>
								<X />
							</Button>
						</div>

						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="companyName">Şirket</Label>
								<Input
									id="companyName"
									value={draft.companyName}
									onChange={(e) => updateDraft({ companyName: e.target.value })}
									required
									maxLength={200}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="roleTr">Rol (TR)</Label>
									<Input
										id="roleTr"
										value={draft.roleTr}
										onChange={(e) => updateDraft({ roleTr: e.target.value })}
										required
										maxLength={200}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="roleEn">Role (EN)</Label>
									<Input
										id="roleEn"
										value={draft.roleEn}
										onChange={(e) => updateDraft({ roleEn: e.target.value })}
										required
										maxLength={200}
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="descTr">Açıklama (TR)</Label>
								<Textarea
									id="descTr"
									rows={3}
									value={draft.descTr}
									onChange={(e) => updateDraft({ descTr: e.target.value })}
									maxLength={3000}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="descEn">Description (EN)</Label>
								<Textarea
									id="descEn"
									rows={3}
									value={draft.descEn}
									onChange={(e) => updateDraft({ descEn: e.target.value })}
									maxLength={3000}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="space-y-2">
									<Label htmlFor="startDate">Başlangıç</Label>
									<Input
										id="startDate"
										type="date"
										value={draft.startDate}
										onChange={(e) => updateDraft({ startDate: e.target.value })}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="endDate">
										Bitiş{" "}
										<span className="text-xs text-muted-foreground">
											(boş = aktif)
										</span>
									</Label>
									<Input
										id="endDate"
										type="date"
										value={draft.endDate}
										onChange={(e) => updateDraft({ endDate: e.target.value })}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="order">Sıra</Label>
									<Input
										id="order"
										type="number"
										min={0}
										max={1000}
										value={draft.order}
										onChange={(e) => updateDraft({ order: Number(e.target.value) })}
									/>
								</div>
							</div>

							{errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}

							<div className="flex items-center gap-2">
								<Button type="submit" disabled={pending}>
									{pending ? "Kaydediliyor..." : "Kaydet"}
								</Button>
								<Button
									type="button"
									variant="ghost"
									onClick={closeDraft}
									disabled={pending}
								>
									İptal
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			)}

			<ul className="space-y-3">
				{items.map((item) => {
					const isActive = !item.endDate;
					return (
						<li key={item.id}>
							<Card className={cn(isActive && "ring-1 ring-emerald-500/40")}>
								<CardContent className="p-5">
									<div className="flex items-start justify-between gap-3">
										<div className="min-w-0">
											<div className="flex items-center gap-2 flex-wrap">
												<p className="text-xs uppercase tracking-wider text-muted-foreground">
													{item.startDate} — {item.endDate || (isActive ? "devam ediyor" : "")}
												</p>
												{isActive && (
													<span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
														Aktif
													</span>
												)}
											</div>
											<h3 className="font-semibold mt-1">{item.roleTr}</h3>
											<p className="text-sm text-muted-foreground">{item.companyName}</p>
										</div>
										<div className="flex items-center gap-1 shrink-0">
											<Button
												size="icon"
												variant="ghost"
												onClick={() => startEdit(item)}
												disabled={pending || !!draft}
											>
												<Pencil />
											</Button>
											<Button
												size="icon"
												variant="ghost"
												className="text-destructive hover:text-destructive"
												onClick={() => handleDelete(item.id)}
												disabled={pending || !!draft}
											>
												<Trash2 />
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						</li>
					);
				})}
				{items.length === 0 && (
					<li className="text-center text-muted-foreground py-12 border border-dashed rounded-xl">
						Henüz deneyim eklenmemiş.
					</li>
				)}
			</ul>
		</div>
	);
}
