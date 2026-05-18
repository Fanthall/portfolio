import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectForm, type ProjectFormValues } from "@/components/admin/ProjectForm";

export const metadata = { title: "Yeni proje — Admin" };

const empty: ProjectFormValues = {
	slug: "",
	titleTr: "",
	titleEn: "",
	summaryTr: "",
	summaryEn: "",
	descTr: "",
	descEn: "",
	coverImage: null,
	demoType: "GALLERY_ONLY",
	demoUrl: "",
	demoFolder: "",
	downloadUrl: "",
	videoUrl: "",
	repoUrl: "",
	isFeatured: false,
	order: 0,
};

export default function NewProjectPage() {
	return (
		<div className="p-8 max-w-3xl">
			<Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
				<Link href="/admin/projects">
					<ArrowLeft /> Listeye dön
				</Link>
			</Button>
			<header className="mb-8">
				<h1 className="text-2xl font-bold tracking-tight">Yeni proje</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Kaydettikten sonra galeri görselleri ve diğer detaylar düzenleme sayfasından
					eklenir.
				</p>
			</header>

			<ProjectForm mode="create" initial={empty} />
		</div>
	);
}
