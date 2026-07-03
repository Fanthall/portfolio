import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { mapAbout } from "@/lib/data/types";
import { parseSkills } from "@/lib/skills";
import { AdminAboutForm } from "@/components/admin/AdminAboutForm";

export const metadata = { title: "Hakkımda — Admin" };

export default async function AdminAboutPage() {
	const supabase = createSupabaseAdminClient();
	const { data } = await supabase
		.from("about_content")
		.select("*")
		.eq("id", 1)
		.maybeSingle();
	const about = data ? mapAbout(data) : null;
	const socialLinks = (about?.socialLinks ?? {}) as {
		github?: string;
		linkedin?: string;
		instagram?: string;
		gmail?: string;
	};

	return (
		<div className="p-8 max-w-3xl">
			<header className="mb-8">
				<h1 className="text-2xl font-bold tracking-tight">Hakkımda</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Site başlığı, profil fotoğrafı, biyografi ve sosyal linkler.
				</p>
			</header>

			<AdminAboutForm
				initial={{
					siteTitle: about?.siteTitle ?? "",
					siteDescription: about?.siteDescription ?? "",
					titleTr: about?.titleTr ?? "",
					titleEn: about?.titleEn ?? "",
					bioTr: about?.bioTr ?? "",
					bioEn: about?.bioEn ?? "",
					photoUrl: about?.photoUrl ?? null,
					github: socialLinks.github ?? "",
					linkedin: socialLinks.linkedin ?? "",
					instagram: socialLinks.instagram ?? "",
					gmail: socialLinks.gmail ?? "",
					roleTr: about?.roleTr ?? "",
					roleEn: about?.roleEn ?? "",
					taglineTr: about?.taglineTr ?? "",
					taglineEn: about?.taglineEn ?? "",
					projectsWorked: about?.projectsWorked ?? null,
					skills: parseSkills(about?.skills),
				}}
			/>
		</div>
	);
}
