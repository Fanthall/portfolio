import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ProjectAssets } from "@/components/admin/ProjectAssets";
import { ProjectForm, type ProjectFormValues } from "@/components/admin/ProjectForm";
import { ProjectGallery } from "@/components/admin/ProjectGallery";

export const metadata = { title: "Proje düzenle — Admin" };

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: PageProps) {
	const { id } = await params;
	const project = await prisma.project.findUnique({
		where: { id },
		include: { images: { orderBy: { order: "asc" } } },
	});

	if (!project) notFound();

	const initial: ProjectFormValues = {
		id: project.id,
		slug: project.slug,
		titleTr: project.titleTr,
		titleEn: project.titleEn,
		summaryTr: project.summaryTr,
		summaryEn: project.summaryEn,
		descTr: project.descTr,
		descEn: project.descEn,
		coverImage: project.coverImage,
		demoType: project.demoType,
		demoUrl: project.demoUrl ?? "",
		demoFolder: project.demoFolder ?? "",
		downloadUrl: project.downloadUrl ?? "",
		videoUrl: project.videoUrl ?? "",
		repoUrl: project.repoUrl ?? "",
		tags: project.tags,
		isFeatured: project.isFeatured,
		order: project.order,
	};

	return (
		<div className="p-8 max-w-3xl">
			<Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
				<Link href="/admin/projects">
					<ArrowLeft /> Listeye dön
				</Link>
			</Button>
			<header className="mb-8">
				<h1 className="text-2xl font-bold tracking-tight">{project.titleTr}</h1>
				<p className="text-sm text-muted-foreground mt-1">
					/projects/{project.slug}
				</p>
			</header>

			<div className="space-y-6">
				<ProjectForm mode="edit" initial={initial} />

				<ProjectAssets
					slug={project.slug}
					demoFolder={project.demoFolder}
					downloadUrl={project.downloadUrl}
				/>

				<ProjectGallery
					projectId={project.id}
					initial={project.images.map((img) => ({
						id: img.id,
						url: img.url,
						altTr: img.altTr ?? "",
						altEn: img.altEn ?? "",
						order: img.order,
					}))}
				/>
			</div>
		</div>
	);
}
