"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, FileArchive, Globe, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface ProjectAssetsProps {
	slug: string;
	demoFolder: string | null;
	downloadUrl: string | null;
}

type Status = "idle" | "uploading" | "deleting" | "error";

export function ProjectAssets({ slug, demoFolder, downloadUrl }: ProjectAssetsProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			<DemoUploader slug={slug} demoFolder={demoFolder} />
			<DownloadUploader slug={slug} downloadUrl={downloadUrl} />
		</div>
	);
}

function DemoUploader({ slug, demoFolder }: { slug: string; demoFolder: string | null }) {
	const router = useRouter();
	const fileRef = useRef<HTMLInputElement>(null);
	const [status, setStatus] = useState<Status>("idle");
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [_isPending, startTransition] = useTransition();

	const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;

		setStatus("uploading");
		setErrorMsg(null);
		try {
			const data = new FormData();
			data.append("file", file);
			const res = await fetch(`/api/admin/upload/demo/${slug}`, {
				method: "POST",
				body: data,
			});
			if (!res.ok) {
				const payload = await res.json().catch(() => ({}));
				const reason =
					{
						file_too_large: "Zip dosyası çok büyük (max 20 MB).",
						not_a_zip: "Sadece .zip yüklenebilir.",
						invalid_zip: "Geçersiz zip dosyası.",
						no_index_html: "Zip içinde index.html bulunamadı.",
						path_traversal: "Güvensiz dosya yolu tespit edildi.",
						unsupported_file: `Desteklenmeyen dosya: ${payload?.path ?? payload?.ext ?? ""}`,
						entry_too_large: "Bir dosya 5 MB sınırını aşıyor.",
						extracted_too_large: "Açılan demo 20 MB'ı aşıyor.",
					}[payload?.error as string] ?? "Yükleme başarısız.";
				setErrorMsg(reason);
				setStatus("error");
				return;
			}
			setStatus("idle");
			startTransition(() => router.refresh());
		} catch {
			setErrorMsg("Bağlantı hatası.");
			setStatus("error");
		}
	};

	const handleDelete = async () => {
		if (!confirm("Yüklü demo'yu silmek istediğine emin misin?")) return;
		setStatus("deleting");
		setErrorMsg(null);
		try {
			const res = await fetch(`/api/admin/upload/demo/${slug}`, { method: "DELETE" });
			if (!res.ok) {
				setErrorMsg("Silme başarısız.");
				setStatus("error");
				return;
			}
			setStatus("idle");
			startTransition(() => router.refresh());
		} catch {
			setErrorMsg("Bağlantı hatası.");
			setStatus("error");
		}
	};

	const busy = status === "uploading" || status === "deleting";
	const uploaded = !!demoFolder;

	return (
		<Card>
			<CardContent className="p-6 space-y-3">
				<div className="flex items-center gap-2">
					<Globe className="h-4 w-4 text-muted-foreground" />
					<Label className="text-sm font-semibold">Demo HTML (iframe)</Label>
				</div>
				<p className="text-xs text-muted-foreground">
					Statik web demo'sunu .zip olarak yükle. Zip kökünde veya tek bir klasörde{" "}
					<code>index.html</code> olmalı. Max 20 MB, dosya başına 5 MB.
				</p>

				{uploaded ? (
					<div className="space-y-2">
						<div className="rounded-md border bg-muted/30 p-3 text-xs flex items-start gap-2">
							<FileArchive className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600" />
							<div className="min-w-0 flex-1">
								<p className="font-medium text-foreground">Yüklü</p>
								<p className="text-muted-foreground break-all">{demoFolder}</p>
							</div>
						</div>
						<div className="flex flex-wrap gap-2">
							<Button asChild size="sm" variant="outline">
								<a href={demoFolder ?? "#"} target="_blank" rel="noopener noreferrer">
									Önizle
								</a>
							</Button>
							<Button size="sm" variant="outline" disabled={busy} onClick={() => fileRef.current?.click()}>
								<Upload /> Yenisi
							</Button>
							<Button
								size="sm"
								variant="ghost"
								className="text-destructive hover:text-destructive"
								disabled={busy}
								onClick={handleDelete}
							>
								<Trash2 /> Sil
							</Button>
						</div>
					</div>
				) : (
					<Button size="sm" variant="outline" disabled={busy} onClick={() => fileRef.current?.click()}>
						<Upload /> {status === "uploading" ? "Yükleniyor..." : "Zip seç"}
					</Button>
				)}

				<input
					ref={fileRef}
					type="file"
					accept=".zip,application/zip"
					className="hidden"
					onChange={handleUpload}
				/>

				{errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}
			</CardContent>
		</Card>
	);
}

function DownloadUploader({
	slug,
	downloadUrl,
}: {
	slug: string;
	downloadUrl: string | null;
}) {
	const router = useRouter();
	const fileRef = useRef<HTMLInputElement>(null);
	const [status, setStatus] = useState<Status>("idle");
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [_isPending, startTransition] = useTransition();

	const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;

		setStatus("uploading");
		setErrorMsg(null);
		try {
			const data = new FormData();
			data.append("file", file);
			const res = await fetch(`/api/admin/upload/download/${slug}`, {
				method: "POST",
				body: data,
			});
			if (!res.ok) {
				const payload = await res.json().catch(() => ({}));
				const reason =
					{
						file_too_large: "Dosya çok büyük (max 150 MB).",
						unsupported_extension: `Desteklenmeyen uzantı: ${payload?.ext ?? ""}`,
					}[payload?.error as string] ?? "Yükleme başarısız.";
				setErrorMsg(reason);
				setStatus("error");
				return;
			}
			setStatus("idle");
			startTransition(() => router.refresh());
		} catch {
			setErrorMsg("Bağlantı hatası.");
			setStatus("error");
		}
	};

	const handleDelete = async () => {
		if (!confirm("Yüklü installer'ı silmek istediğine emin misin?")) return;
		setStatus("deleting");
		setErrorMsg(null);
		try {
			const res = await fetch(`/api/admin/upload/download/${slug}`, { method: "DELETE" });
			if (!res.ok) {
				setErrorMsg("Silme başarısız.");
				setStatus("error");
				return;
			}
			setStatus("idle");
			startTransition(() => router.refresh());
		} catch {
			setErrorMsg("Bağlantı hatası.");
			setStatus("error");
		}
	};

	const busy = status === "uploading" || status === "deleting";
	const uploaded = !!downloadUrl && downloadUrl.startsWith("/downloads/");

	return (
		<Card>
			<CardContent className="p-6 space-y-3">
				<div className="flex items-center gap-2">
					<Download className="h-4 w-4 text-muted-foreground" />
					<Label className="text-sm font-semibold">Installer / indirilebilir dosya</Label>
				</div>
				<p className="text-xs text-muted-foreground">
					Electron .exe, .dmg, .deb, .AppImage gibi installer'ları veya .zip arşivlerini
					yükle. Max 150 MB.
				</p>

				{uploaded ? (
					<div className="space-y-2">
						<div className="rounded-md border bg-muted/30 p-3 text-xs flex items-start gap-2">
							<Download className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600" />
							<div className="min-w-0 flex-1">
								<p className="font-medium text-foreground">Yüklü</p>
								<p className="text-muted-foreground break-all">{downloadUrl}</p>
							</div>
						</div>
						<div className="flex flex-wrap gap-2">
							<Button asChild size="sm" variant="outline">
								<a href={downloadUrl ?? "#"} download>
									İndir
								</a>
							</Button>
							<Button size="sm" variant="outline" disabled={busy} onClick={() => fileRef.current?.click()}>
								<Upload /> Yenisi
							</Button>
							<Button
								size="sm"
								variant="ghost"
								className="text-destructive hover:text-destructive"
								disabled={busy}
								onClick={handleDelete}
							>
								<Trash2 /> Sil
							</Button>
						</div>
					</div>
				) : (
					<Button size="sm" variant="outline" disabled={busy} onClick={() => fileRef.current?.click()}>
						<Upload /> {status === "uploading" ? "Yükleniyor..." : "Dosya seç"}
					</Button>
				)}

				<input
					ref={fileRef}
					type="file"
					accept=".exe,.msi,.dmg,.pkg,.deb,.rpm,.AppImage,.appimage,.zip,.tar.gz,.tgz"
					className="hidden"
					onChange={handleUpload}
				/>

				{errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}
			</CardContent>
		</Card>
	);
}
