import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { mapProject, mapProjectImage } from "@/lib/data/types";
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
	const supabase = createSupabaseAdminClient();
	const { data: row } = await supabase
		.from("project")
		.select("*, project_image(*)")
		.eq("id", id)
		.maybeSingle();

	if (!row) notFound();

	const project = mapProject(row);
	const images = (Array.isArray(row.project_image) ? row.project_image : [])
		.map(mapProjectImage)
		.sort((a, b) => a.order - b.order);

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
					initial={images.map((img) => ({
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
