"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface ImageItem {
	id: string;
	url: string;
	altTr: string;
	altEn: string;
	order: number;
}

interface ProjectGalleryProps {
	projectId: string;
	initial: ImageItem[];
}

export function ProjectGallery({ projectId, initial }: ProjectGalleryProps) {
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [images, setImages] = useState<ImageItem[]>(initial);
	const [uploading, setUploading] = useState(false);
	const [pendingId, setPendingId] = useState<string | null>(null);
	const [_isPending, startTransition] = useTransition();

	const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files ?? []);
		event.target.value = "";
		if (files.length === 0) return;

		setUploading(true);
		try {
			for (const file of files) {
				const data = new FormData();
				data.append("file", file);
				const uploadRes = await fetch("/api/admin/upload/image", {
					method: "POST",
					body: data,
				});
				if (!uploadRes.ok) continue;
				const { url } = (await uploadRes.json()) as { url: string };

				const addRes = await fetch(`/api/admin/projects/${projectId}/images`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ url }),
				});
				if (!addRes.ok) continue;
				const { image } = (await addRes.json()) as {
					image: { id: string; url: string; order: number };
				};
				setImages((prev) => [
					...prev,
					{
						id: image.id,
						url: image.url,
						altTr: "",
						altEn: "",
						order: image.order,
					},
				]);
			}
			startTransition(() => router.refresh());
		} finally {
			setUploading(false);
		}
	};

	const handleDelete = async (imageId: string) => {
		if (!confirm("Bu görseli silmek istediğine emin misin?")) return;
		setPendingId(imageId);
		try {
			const res = await fetch(
				`/api/admin/projects/${projectId}/images/${imageId}`,
				{ method: "DELETE" },
			);
			if (res.ok) {
				setImages((prev) => prev.filter((i) => i.id !== imageId));
				startTransition(() => router.refresh());
			}
		} finally {
			setPendingId(null);
		}
	};

	return (
		<Card>
			<CardContent className="p-6 space-y-4">
				<div className="flex items-center justify-between gap-3">
					<div>
						<Label className="text-sm font-semibold">Görsel galeri</Label>
						<p className="text-xs text-muted-foreground mt-1">
							Demo türü "Galeri" veya genel detay sayfasında gösterilir.
						</p>
					</div>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/png,image/jpeg,image/webp"
						multiple
						className="hidden"
						onChange={handleUpload}
					/>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => fileInputRef.current?.click()}
						disabled={uploading}
					>
						<Upload /> {uploading ? "Yükleniyor..." : "Görsel ekle"}
					</Button>
				</div>

				{images.length === 0 ? (
					<div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
						<ImagePlus className="h-6 w-6 mx-auto mb-2 opacity-50" />
						Henüz görsel eklenmemiş.
					</div>
				) : (
					<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
						{images.map((img) => (
							<div
								key={img.id}
								className="group relative aspect-video rounded-lg overflow-hidden ring-1 ring-border bg-muted"
							>
								<Image src={img.url} alt="" fill className="object-cover" />
								<button
									type="button"
									onClick={() => handleDelete(img.id)}
									disabled={pendingId === img.id}
									aria-label="Sil"
									className="absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-md bg-destructive/90 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
								>
									<Trash2 className="h-4 w-4" />
								</button>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
