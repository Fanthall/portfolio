"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronDown, Image as ImageIcon, Save, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type PageKey = "HOME" | "ABOUT" | "CAREER" | "PROJECTS" | "CONTACT";

interface PageItem {
	pageKey: PageKey;
	label: string;
	path: string;
	titleTr: string;
	titleEn: string;
	descriptionTr: string;
	descriptionEn: string;
	ogImage: string | null;
	noIndex: boolean;
}

interface AdminSeoFormProps {
	initial: PageItem[];
}

type Status = "idle" | "saving" | "success" | "error";

export function AdminSeoForm({ initial }: AdminSeoFormProps) {
	const router = useRouter();
	const [items, setItems] = useState<PageItem[]>(initial);
	const [openKey, setOpenKey] = useState<PageKey | null>(initial[0]?.pageKey ?? null);
	const [status, setStatus] = useState<Status>("idle");
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [_isPending, startTransition] = useTransition();

	const update = (key: PageKey, patch: Partial<PageItem>) =>
		setItems((prev) => prev.map((item) => (item.pageKey === key ? { ...item, ...patch } : item)));

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setStatus("saving");
		setErrorMsg(null);

		try {
			const res = await fetch("/api/admin/seo", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					pages: items.map(({ pageKey, titleTr, titleEn, descriptionTr, descriptionEn, ogImage, noIndex }) => ({
						pageKey,
						titleTr,
						titleEn,
						descriptionTr,
						descriptionEn,
						ogImage,
						noIndex,
					})),
				}),
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setErrorMsg(data?.error === "validation_error" ? "Form alanlarını kontrol et." : "Kaydetme başarısız.");
				setStatus("error");
				return;
			}
			setStatus("success");
			startTransition(() => router.refresh());
		} catch {
			setErrorMsg("Bağlantı hatası.");
			setStatus("error");
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{items.map((item) => (
				<PageAccordion
					key={item.pageKey}
					item={item}
					open={openKey === item.pageKey}
					onToggle={() => setOpenKey((cur) => (cur === item.pageKey ? null : item.pageKey))}
					onChange={(patch) => update(item.pageKey, patch)}
				/>
			))}

			<div className="flex items-center gap-3 pt-2">
				<Button type="submit" disabled={status === "saving"}>
					<Save /> {status === "saving" ? "Kaydediliyor..." : "Kaydet"}
				</Button>
				{status === "success" && <p className="text-sm text-emerald-500">Kaydedildi.</p>}
				{errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}
			</div>
		</form>
	);
}

interface PageAccordionProps {
	item: PageItem;
	open: boolean;
	onToggle: () => void;
	onChange: (patch: Partial<PageItem>) => void;
}

function PageAccordion({ item, open, onToggle, onChange }: PageAccordionProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState(false);
	const [activeLocale, setActiveLocale] = useState<"tr" | "en">("tr");

	const handleFilePick = () => fileInputRef.current?.click();

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;
		setUploading(true);
		try {
			const data = new FormData();
			data.append("file", file);
			const res = await fetch("/api/admin/upload/image", { method: "POST", body: data });
			if (res.ok) {
				const { url } = (await res.json()) as { url: string };
				onChange({ ogImage: url });
			}
		} finally {
			setUploading(false);
		}
	};

	const hasCustom =
		item.titleTr || item.titleEn || item.descriptionTr || item.descriptionEn || item.ogImage;
	const isHidden = item.noIndex;

	return (
		<Card>
			<button
				type="button"
				onClick={onToggle}
				className="w-full flex items-center justify-between gap-3 p-5 text-left hover:bg-accent/50 transition-colors"
			>
				<div className="flex items-center gap-3 min-w-0">
					<div className="min-w-0">
						<p className="font-semibold">{item.label}</p>
						<p className="text-xs text-muted-foreground truncate">{item.path}</p>
					</div>
					{hasCustom && (
						<span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
							Özel
						</span>
					)}
					{isHidden && (
						<span className="inline-flex items-center rounded-full bg-destructive/10 text-destructive px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
							Gizli
						</span>
					)}
				</div>
				<ChevronDown
					className={cn(
						"h-4 w-4 text-muted-foreground transition-transform",
						open && "rotate-180",
					)}
				/>
			</button>
			{open && (
				<CardContent className="p-6 pt-0 space-y-4 border-t">
					{/* Index/noIndex */}
					<label className="flex items-start gap-3 rounded-md border bg-muted/30 p-3 cursor-pointer">
						<input
							type="checkbox"
							checked={item.noIndex}
							onChange={(e) => onChange({ noIndex: e.target.checked })}
							className="mt-0.5 h-4 w-4 rounded border-input"
						/>
						<div>
							<p className="text-sm font-medium">
								Arama motorlarından gizle (noindex)
							</p>
							<p className="text-xs text-muted-foreground mt-0.5">
								Bu sayfa Google/Bing tarafından indekslenmez ve sitemap'e dahil edilmez.
							</p>
						</div>
					</label>

					{/* OG Image */}
					<div>
						<Label className="mb-2 block">OG image (sosyal paylaşım görseli)</Label>
						<div className="flex items-center gap-4">
							<div className="relative h-20 w-32 rounded-lg overflow-hidden ring-1 ring-border bg-muted shrink-0">
								{item.ogImage ? (
									<Image src={item.ogImage} alt="OG" fill className="object-cover" />
								) : (
									<div className="flex h-full w-full items-center justify-center text-muted-foreground">
										<ImageIcon className="h-6 w-6" />
									</div>
								)}
							</div>
							<div className="flex flex-col gap-2">
								<input
									ref={fileInputRef}
									type="file"
									accept="image/png,image/jpeg,image/webp"
									className="hidden"
									onChange={handleFileChange}
								/>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={handleFilePick}
									disabled={uploading}
								>
									<Upload /> {uploading ? "Yükleniyor..." : "OG image seç"}
								</Button>
								{item.ogImage && (
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="text-destructive hover:text-destructive"
										onClick={() => onChange({ ogImage: null })}
									>
										<X /> Kaldır
									</Button>
								)}
							</div>
						</div>
					</div>

					{/* Locale tabs */}
					<div className="inline-flex rounded-md border bg-muted/40 p-1">
						{(["tr", "en"] as const).map((loc) => (
							<button
								key={loc}
								type="button"
								onClick={() => setActiveLocale(loc)}
								className={cn(
									"px-3 py-1.5 text-xs font-medium uppercase tracking-wider rounded transition-colors",
									activeLocale === loc
										? "bg-background shadow text-foreground"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								{loc}
							</button>
						))}
					</div>

					{activeLocale === "tr" ? (
						<div className="space-y-3">
							<div className="space-y-2">
								<Label htmlFor={`titleTr-${item.pageKey}`}>Başlık (TR)</Label>
								<Input
									id={`titleTr-${item.pageKey}`}
									maxLength={200}
									value={item.titleTr}
									onChange={(e) => onChange({ titleTr: e.target.value })}
									placeholder="Boş bırakılırsa varsayılan başlık kullanılır"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor={`descTr-${item.pageKey}`}>Açıklama (TR)</Label>
								<Textarea
									id={`descTr-${item.pageKey}`}
									maxLength={400}
									rows={3}
									value={item.descriptionTr}
									onChange={(e) => onChange({ descriptionTr: e.target.value })}
									placeholder="Meta description — boş bırakılırsa site açıklaması kullanılır"
								/>
							</div>
						</div>
					) : (
						<div className="space-y-3">
							<div className="space-y-2">
								<Label htmlFor={`titleEn-${item.pageKey}`}>Title (EN)</Label>
								<Input
									id={`titleEn-${item.pageKey}`}
									maxLength={200}
									value={item.titleEn}
									onChange={(e) => onChange({ titleEn: e.target.value })}
									placeholder="Falls back to default if empty"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor={`descEn-${item.pageKey}`}>Description (EN)</Label>
								<Textarea
									id={`descEn-${item.pageKey}`}
									maxLength={400}
									rows={3}
									value={item.descriptionEn}
									onChange={(e) => onChange({ descriptionEn: e.target.value })}
									placeholder="Falls back to site description if empty"
								/>
							</div>
						</div>
					)}
				</CardContent>
			)}
		</Card>
	);
}
