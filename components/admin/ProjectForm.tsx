"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Image as ImageIcon, Save, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type DemoType =
	| "EXTERNAL_LINK"
	| "EMBEDDED_HTML"
	| "DOWNLOAD_ONLY"
	| "VIDEO_ONLY"
	| "GALLERY_ONLY";

const DEMO_TYPE_LABELS: Record<DemoType, string> = {
	EXTERNAL_LINK: "Dış link (URL aç)",
	EMBEDDED_HTML: "Embed HTML (iframe)",
	DOWNLOAD_ONLY: "Sadece indirme (.exe vs.)",
	VIDEO_ONLY: "Sadece video (YouTube/Vimeo embed URL)",
	GALLERY_ONLY: "Sadece görsel galeri",
};

export interface ProjectFormValues {
	id?: string;
	slug: string;
	titleTr: string;
	titleEn: string;
	summaryTr: string;
	summaryEn: string;
	descTr: string;
	descEn: string;
	coverImage: string | null;
	demoType: DemoType;
	demoUrl: string;
	demoFolder: string;
	downloadUrl: string;
	videoUrl: string;
	repoUrl: string;
	isFeatured: boolean;
	order: number;
}

interface ProjectFormProps {
	mode: "create" | "edit";
	initial: ProjectFormValues;
}

export function ProjectForm({ mode, initial }: ProjectFormProps) {
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [values, setValues] = useState<ProjectFormValues>(initial);
	const [activeLocale, setActiveLocale] = useState<"tr" | "en">("tr");
	const [uploading, setUploading] = useState(false);
	const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [_isPending, startTransition] = useTransition();

	const update = (patch: Partial<ProjectFormValues>) =>
		setValues((cur) => ({ ...cur, ...patch }));

	const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
				update({ coverImage: url });
			}
		} finally {
			setUploading(false);
		}
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setStatus("saving");
		setErrorMsg(null);

		const payload = {
			...values,
			coverImage: values.coverImage,
			demoUrl: values.demoUrl || null,
			demoFolder: values.demoFolder || null,
			downloadUrl: values.downloadUrl || null,
			videoUrl: values.videoUrl || null,
			repoUrl: values.repoUrl || null,
			order: Number(values.order) || 0,
		};

		try {
			const url =
				mode === "edit" && values.id
					? `/api/admin/projects/${values.id}`
					: "/api/admin/projects";
			const method = mode === "edit" ? "PATCH" : "POST";

			const res = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				const reason =
					data?.error === "slug_taken"
						? "Bu slug zaten kullanılıyor."
						: data?.error === "validation_error"
							? "Form alanlarını kontrol et."
							: "Kaydetme başarısız.";
				setErrorMsg(reason);
				setStatus("error");
				return;
			}

			setStatus("success");
			if (mode === "create") {
				const { project } = (await res.json()) as { project: { id: string } };
				startTransition(() => router.push(`/admin/projects/${project.id}`));
			} else {
				startTransition(() => router.refresh());
			}
		} catch {
			setErrorMsg("Bağlantı hatası.");
			setStatus("error");
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Basics */}
			<Card>
				<CardContent className="p-6 space-y-4">
					<Label className="text-sm font-semibold">Temel</Label>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="slug">
								Slug <span className="text-xs text-muted-foreground">(URL)</span>
							</Label>
							<Input
								id="slug"
								value={values.slug}
								onChange={(e) => update({ slug: e.target.value.toLowerCase() })}
								required
								pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
								maxLength={80}
								placeholder="ornek-proje"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="order">Sıra</Label>
							<Input
								id="order"
								type="number"
								min={0}
								max={1000}
								value={values.order}
								onChange={(e) => update({ order: Number(e.target.value) })}
							/>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<label className="flex items-center gap-2 cursor-pointer">
							<input
								type="checkbox"
								checked={values.isFeatured}
								onChange={(e) => update({ isFeatured: e.target.checked })}
								className="h-4 w-4 rounded border-input"
							/>
							<span className="text-sm">Öne çıkan proje (anasayfada gösterilir)</span>
						</label>
					</div>
				</CardContent>
			</Card>

			{/* Title + summary + desc with locale tabs */}
			<Card>
				<CardContent className="p-6 space-y-4">
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
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="titleTr">Başlık (TR)</Label>
								<Input
									id="titleTr"
									value={values.titleTr}
									onChange={(e) => update({ titleTr: e.target.value })}
									required
									maxLength={200}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="summaryTr">Özet (TR)</Label>
								<Textarea
									id="summaryTr"
									rows={2}
									value={values.summaryTr}
									onChange={(e) => update({ summaryTr: e.target.value })}
									required
									maxLength={500}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="descTr">Detay (TR)</Label>
								<Textarea
									id="descTr"
									rows={6}
									value={values.descTr}
									onChange={(e) => update({ descTr: e.target.value })}
									required
									maxLength={5000}
								/>
							</div>
						</div>
					) : (
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="titleEn">Title (EN)</Label>
								<Input
									id="titleEn"
									value={values.titleEn}
									onChange={(e) => update({ titleEn: e.target.value })}
									required
									maxLength={200}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="summaryEn">Summary (EN)</Label>
								<Textarea
									id="summaryEn"
									rows={2}
									value={values.summaryEn}
									onChange={(e) => update({ summaryEn: e.target.value })}
									required
									maxLength={500}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="descEn">Description (EN)</Label>
								<Textarea
									id="descEn"
									rows={6}
									value={values.descEn}
									onChange={(e) => update({ descEn: e.target.value })}
									required
									maxLength={5000}
								/>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Cover image */}
			<Card>
				<CardContent className="p-6 space-y-4">
					<Label>Kapak görseli</Label>
					<div className="flex items-center gap-4">
						<div className="relative h-24 w-40 rounded-lg overflow-hidden ring-1 ring-border bg-muted">
							{values.coverImage ? (
								<Image src={values.coverImage} alt="Cover" fill className="object-cover" />
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
								onChange={handleCoverUpload}
							/>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => fileInputRef.current?.click()}
								disabled={uploading}
							>
								<Upload /> {uploading ? "Yükleniyor..." : "Görsel seç"}
							</Button>
							{values.coverImage && (
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="text-destructive hover:text-destructive"
									onClick={() => update({ coverImage: null })}
								>
									<X /> Kaldır
								</Button>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Demo */}
			<Card>
				<CardContent className="p-6 space-y-4">
					<Label className="text-sm font-semibold">Demo</Label>
					<div className="space-y-2">
						<Label htmlFor="demoType">Demo türü</Label>
						<select
							id="demoType"
							value={values.demoType}
							onChange={(e) => update({ demoType: e.target.value as DemoType })}
							className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
						>
							{(Object.keys(DEMO_TYPE_LABELS) as DemoType[]).map((t) => (
								<option key={t} value={t}>
									{DEMO_TYPE_LABELS[t]}
								</option>
							))}
						</select>
					</div>

					{values.demoType === "EXTERNAL_LINK" && (
						<div className="space-y-2">
							<Label htmlFor="demoUrl">Demo URL</Label>
							<Input
								id="demoUrl"
								type="url"
								value={values.demoUrl}
								onChange={(e) => update({ demoUrl: e.target.value })}
								placeholder="https://demo.example.com"
							/>
						</div>
					)}
					{values.demoType === "EMBEDDED_HTML" && (
						<div className="space-y-2">
							<Label htmlFor="demoFolder">Demo klasör yolu</Label>
							<Input
								id="demoFolder"
								value={values.demoFolder}
								onChange={(e) => update({ demoFolder: e.target.value })}
								placeholder="/demos/proje-slug/"
							/>
							<p className="text-xs text-muted-foreground">
								Demo zip upload özelliği yakında. Şimdilik manuel yola işaret edebilirsin.
							</p>
						</div>
					)}
					{values.demoType === "DOWNLOAD_ONLY" && (
						<div className="space-y-2">
							<Label htmlFor="downloadUrl">İndirme URL'i</Label>
							<Input
								id="downloadUrl"
								type="url"
								value={values.downloadUrl}
								onChange={(e) => update({ downloadUrl: e.target.value })}
								placeholder="https://github.com/.../releases/latest"
							/>
						</div>
					)}
					{values.demoType === "VIDEO_ONLY" && (
						<div className="space-y-2">
							<Label htmlFor="videoUrl">Video embed URL'i</Label>
							<Input
								id="videoUrl"
								type="url"
								value={values.videoUrl}
								onChange={(e) => update({ videoUrl: e.target.value })}
								placeholder="https://www.youtube.com/embed/..."
							/>
						</div>
					)}

					<div className="space-y-2">
						<Label htmlFor="repoUrl">GitHub / kaynak repo URL'i</Label>
						<Input
							id="repoUrl"
							type="url"
							value={values.repoUrl}
							onChange={(e) => update({ repoUrl: e.target.value })}
							placeholder="https://github.com/..."
						/>
					</div>
				</CardContent>
			</Card>

			<div className="flex items-center gap-3">
				<Button type="submit" disabled={status === "saving"}>
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
