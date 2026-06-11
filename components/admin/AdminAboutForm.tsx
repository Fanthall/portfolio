"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Save, Trash2, Upload, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SkillGroup } from "@/lib/skills";

interface SkillGroupDraft {
	titleTr: string;
	titleEn: string;
	itemsText: string;
}

interface InitialValues {
	siteTitle: string;
	siteDescription: string;
	titleTr: string;
	titleEn: string;
	bioTr: string;
	bioEn: string;
	photoUrl: string | null;
	github: string;
	linkedin: string;
	instagram: string;
	gmail: string;
	skills: SkillGroup[];
}

interface AdminAboutFormProps {
	initial: InitialValues;
}

type FormStatus = "idle" | "saving" | "uploading" | "success" | "error";

export function AdminAboutForm({ initial }: AdminAboutFormProps) {
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [photoUrl, setPhotoUrl] = useState<string | null>(initial.photoUrl);
	const [status, setStatus] = useState<FormStatus>("idle");
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<"tr" | "en">("tr");
	const [skillGroups, setSkillGroups] = useState<SkillGroupDraft[]>(
		initial.skills.map((g) => ({
			titleTr: g.titleTr,
			titleEn: g.titleEn,
			itemsText: g.items.join(", "),
		})),
	);
	const [_isPending, startTransition] = useTransition();

	const updateSkillGroup = (index: number, patch: Partial<SkillGroupDraft>) =>
		setSkillGroups((cur) => cur.map((g, i) => (i === index ? { ...g, ...patch } : g)));

	const handleFilePick = () => fileInputRef.current?.click();

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;

		setStatus("uploading");
		setErrorMsg(null);

		const data = new FormData();
		data.append("file", file);

		try {
			const res = await fetch("/api/admin/upload/image", { method: "POST", body: data });
			if (!res.ok) {
				const payload = await res.json().catch(() => ({}));
				const reason =
					payload?.error === "file_too_large"
						? "Dosya çok büyük (max 5 MB)."
						: payload?.error === "unsupported_mime"
							? "Bu dosya tipi desteklenmiyor."
							: "Yükleme başarısız.";
				setErrorMsg(reason);
				setStatus("error");
				return;
			}
			const { url } = (await res.json()) as { url: string };
			setPhotoUrl(url);
			setStatus("idle");
		} catch {
			setErrorMsg("Yükleme sırasında bağlantı hatası.");
			setStatus("error");
		}
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const form = event.currentTarget;
		const data = new FormData(form);

		const payload = {
			siteTitle: String(data.get("siteTitle") ?? "").trim(),
			siteDescription: String(data.get("siteDescription") ?? "").trim(),
			titleTr: String(data.get("titleTr") ?? "").trim(),
			titleEn: String(data.get("titleEn") ?? "").trim(),
			bioTr: String(data.get("bioTr") ?? "").trim(),
			bioEn: String(data.get("bioEn") ?? "").trim(),
			photoUrl: photoUrl ?? null,
			skills: skillGroups
				.map((g) => ({
					titleTr: g.titleTr.trim(),
					titleEn: g.titleEn.trim(),
					items: g.itemsText
						.split(",")
						.map((s) => s.trim())
						.filter(Boolean)
						.slice(0, 20),
				}))
				.filter((g) => g.titleTr && g.titleEn && g.items.length > 0),
			socialLinks: {
				github: String(data.get("github") ?? "").trim(),
				linkedin: String(data.get("linkedin") ?? "").trim(),
				instagram: String(data.get("instagram") ?? "").trim(),
				gmail: String(data.get("gmail") ?? "").trim(),
			},
		};

		setStatus("saving");
		setErrorMsg(null);

		try {
			const res = await fetch("/api/admin/about", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
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

	const saving = status === "saving" || status === "uploading";

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Site Meta — browser title + default description */}
			<Card>
				<CardContent className="p-6 space-y-4">
					<div>
						<Label className="text-sm font-semibold">Site meta</Label>
						<p className="text-xs text-muted-foreground mt-1">
							Tarayıcı sekmesinde görünen başlık ve site geneli açıklama (SEO için
							sayfa bazlı override edilebilir).
						</p>
					</div>
					<div className="space-y-2">
						<Label htmlFor="siteTitle">Site başlığı (browser &lt;title&gt;)</Label>
						<Input
							id="siteTitle"
							name="siteTitle"
							maxLength={120}
							defaultValue={initial.siteTitle}
							placeholder="Sezer Demir DEDEK"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="siteDescription">Site açıklaması (meta description)</Label>
						<Textarea
							id="siteDescription"
							name="siteDescription"
							maxLength={300}
							rows={2}
							defaultValue={initial.siteDescription}
							placeholder="Front-End focused software engineer — portfolio"
						/>
					</div>
				</CardContent>
			</Card>

			{/* Photo */}
			<Card>
				<CardContent className="p-6">
					<Label className="mb-3 block">Profil fotoğrafı</Label>
					<div className="flex items-center gap-4">
						<div className="relative h-24 w-24 rounded-2xl overflow-hidden ring-2 ring-border bg-muted">
							{photoUrl ? (
								<Image src={photoUrl} alt="Profile" fill className="object-cover" />
							) : (
								<div className="flex h-full w-full items-center justify-center text-muted-foreground">
									<ImageIcon className="h-8 w-8" />
								</div>
							)}
						</div>
						<div className="flex flex-col gap-2">
							<input
								ref={fileInputRef}
								type="file"
								accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
								className="hidden"
								onChange={handleFileChange}
							/>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={handleFilePick}
								disabled={status === "uploading"}
							>
								<Upload /> {status === "uploading" ? "Yükleniyor..." : "Dosya seç"}
							</Button>
							{photoUrl && (
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="text-destructive hover:text-destructive"
									onClick={() => setPhotoUrl(null)}
								>
									<X /> Kaldır
								</Button>
							)}
							<p className="text-xs text-muted-foreground">
								PNG / JPG / WEBP / GIF / SVG · max 5 MB
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Title + bio with TR/EN tabs */}
			<Card>
				<CardContent className="p-6 space-y-4">
					<div className="inline-flex rounded-md border bg-muted/40 p-1">
						{(["tr", "en"] as const).map((loc) => (
							<button
								key={loc}
								type="button"
								onClick={() => setActiveTab(loc)}
								className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wider rounded transition-colors ${
									activeTab === loc
										? "bg-background shadow text-foreground"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								{loc}
							</button>
						))}
					</div>

					<div className={activeTab === "tr" ? "" : "hidden"}>
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="titleTr">Başlık (TR)</Label>
								<Input id="titleTr" name="titleTr" required maxLength={200} defaultValue={initial.titleTr} />
							</div>
							<div className="space-y-2">
								<Label htmlFor="bioTr">Biyografi (TR)</Label>
								<Textarea id="bioTr" name="bioTr" required minLength={1} maxLength={5000} rows={10} defaultValue={initial.bioTr} />
							</div>
						</div>
					</div>

					<div className={activeTab === "en" ? "" : "hidden"}>
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="titleEn">Title (EN)</Label>
								<Input id="titleEn" name="titleEn" required maxLength={200} defaultValue={initial.titleEn} />
							</div>
							<div className="space-y-2">
								<Label htmlFor="bioEn">Bio (EN)</Label>
								<Textarea id="bioEn" name="bioEn" required minLength={1} maxLength={5000} rows={10} defaultValue={initial.bioEn} />
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Skills */}
			<Card>
				<CardContent className="p-6 space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<Label className="text-sm font-semibold">Beceriler</Label>
							<p className="text-xs text-muted-foreground mt-1">
								Hakkımda sayfasındaki beceri grupları. Maddeleri virgülle ayır. Hiç grup
								kalmazsa varsayılan liste gösterilir.
							</p>
						</div>
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={skillGroups.length >= 8}
							onClick={() =>
								setSkillGroups((cur) => [...cur, { titleTr: "", titleEn: "", itemsText: "" }])
							}
						>
							<Plus /> Grup ekle
						</Button>
					</div>
					{skillGroups.map((group, index) => (
						<div key={index} className="rounded-lg border p-4 space-y-3">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
								<div className="space-y-2">
									<Label htmlFor={`skill-title-tr-${index}`}>Grup başlığı (TR)</Label>
									<Input
										id={`skill-title-tr-${index}`}
										value={group.titleTr}
										maxLength={60}
										onChange={(e) => updateSkillGroup(index, { titleTr: e.target.value })}
										placeholder="Front-End"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor={`skill-title-en-${index}`}>Group title (EN)</Label>
									<Input
										id={`skill-title-en-${index}`}
										value={group.titleEn}
										maxLength={60}
										onChange={(e) => updateSkillGroup(index, { titleEn: e.target.value })}
										placeholder="Front-End"
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor={`skill-items-${index}`}>
									Maddeler{" "}
									<span className="text-xs text-muted-foreground">(virgülle ayır, en çok 20)</span>
								</Label>
								<Input
									id={`skill-items-${index}`}
									value={group.itemsText}
									onChange={(e) => updateSkillGroup(index, { itemsText: e.target.value })}
									placeholder="React.js, TypeScript, Next.js"
								/>
							</div>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="text-destructive hover:text-destructive"
								onClick={() => setSkillGroups((cur) => cur.filter((_, i) => i !== index))}
							>
								<Trash2 /> Grubu kaldır
							</Button>
						</div>
					))}
				</CardContent>
			</Card>

			{/* Socials */}
			<Card>
				<CardContent className="p-6 space-y-4">
					<Label className="block">Sosyal linkler</Label>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="github">GitHub</Label>
							<Input id="github" name="github" type="url" defaultValue={initial.github} placeholder="https://github.com/..." />
						</div>
						<div className="space-y-2">
							<Label htmlFor="linkedin">LinkedIn</Label>
							<Input id="linkedin" name="linkedin" type="url" defaultValue={initial.linkedin} placeholder="https://www.linkedin.com/in/..." />
						</div>
						<div className="space-y-2">
							<Label htmlFor="instagram">Instagram</Label>
							<Input id="instagram" name="instagram" type="url" defaultValue={initial.instagram} placeholder="https://www.instagram.com/..." />
						</div>
						<div className="space-y-2">
							<Label htmlFor="gmail">E-posta</Label>
							<Input id="gmail" name="gmail" type="email" defaultValue={initial.gmail} placeholder="ornek@example.com" />
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Footer */}
			<div className="flex items-center gap-3">
				<Button type="submit" disabled={saving}>
					<Save /> {status === "saving" ? "Kaydediliyor..." : "Kaydet"}
				</Button>
				{status === "success" && (
					<p className="text-sm text-emerald-500">Kaydedildi.</p>
				)}
				{errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}
			</div>
		</form>
	);
}
