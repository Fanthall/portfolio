import Link from "next/link";
import Image from "next/image";
import { Download, ExternalLink } from "lucide-react";
import type { Project, ProjectImage as ProjectImageRow } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ProjectDemoProps {
	project: Project & { images: ProjectImageRow[] };
	locale: "tr" | "en";
	labels: {
		downloadCta: string;
		openExternal: string;
		demoUnavailable: string;
	};
}

export function ProjectDemo({ project, locale, labels }: ProjectDemoProps) {
	switch (project.demoType) {
		case "EXTERNAL_LINK":
			if (!project.demoUrl) return null;
			return (
				<div className="rounded-xl border bg-card p-6 flex items-center justify-between gap-4">
					<div>
						<p className="text-sm text-muted-foreground">{labels.openExternal}</p>
						<p className="text-base font-medium truncate">{project.demoUrl}</p>
					</div>
					<Button asChild>
						<Link href={project.demoUrl} target="_blank" rel="noopener noreferrer">
							<ExternalLink />
							{labels.openExternal}
						</Link>
					</Button>
				</div>
			);

		case "EMBEDDED_HTML":
			if (!project.demoFolder) return null;
			return (
				<div className="rounded-xl border overflow-hidden bg-card">
					<iframe
						src={project.demoFolder}
						title={locale === "tr" ? project.titleTr : project.titleEn}
						className="w-full h-[480px] border-0"
						sandbox="allow-scripts allow-same-origin"
					/>
				</div>
			);

		case "DOWNLOAD_ONLY":
			if (!project.downloadUrl) {
				return (
					<p className="text-sm text-muted-foreground">{labels.demoUnavailable}</p>
				);
			}
			return (
				<div className="rounded-xl border bg-card p-6 flex items-center justify-between gap-4">
					<div>
						<p className="text-sm text-muted-foreground">{labels.downloadCta}</p>
					</div>
					<Button asChild>
						<a href={project.downloadUrl} download>
							<Download />
							{labels.downloadCta}
						</a>
					</Button>
				</div>
			);

		case "VIDEO_ONLY":
			if (!project.videoUrl) return null;
			return (
				<div className="rounded-xl border overflow-hidden bg-card">
					<div className="aspect-video">
						<iframe
							src={project.videoUrl}
							title={locale === "tr" ? project.titleTr : project.titleEn}
							className="w-full h-full border-0"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowFullScreen
						/>
					</div>
				</div>
			);

		case "GALLERY_ONLY":
		default:
			if (project.images.length === 0) {
				return (
					<p className="text-sm text-muted-foreground">{labels.demoUnavailable}</p>
				);
			}
			return (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{project.images.map((img) => (
						<Card key={img.id} className="overflow-hidden">
							<CardContent className="p-0">
								<div className="relative aspect-video w-full bg-muted">
									<Image
										src={img.url}
										alt={(locale === "tr" ? img.altTr : img.altEn) ?? ""}
										fill
										className="object-cover"
									/>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			);
	}
}
