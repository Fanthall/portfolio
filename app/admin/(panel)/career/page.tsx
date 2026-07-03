import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { mapWork } from "@/lib/data/types";
import { CareerManager } from "@/components/admin/CareerManager";

export const metadata = { title: "Kariyer — Admin" };

export default async function AdminCareerPage() {
	const supabase = createSupabaseAdminClient();
	const { data } = await supabase
		.from("work_experience")
		.select("*")
		.order("order", { ascending: true })
		.order("start_date", { ascending: false });
	const experiences = (data ?? []).map(mapWork);

	return (
		<div className="p-8 max-w-4xl">
			<header className="mb-8">
				<h1 className="text-2xl font-bold tracking-tight">Kariyer</h1>
				<p className="text-sm text-muted-foreground mt-1">
					İş deneyimlerini buradan yönet. Aynı şirket adına eklenen kayıtlar otomatik
					gruplanır. Bitiş tarihi boş bırakılırsa "Aktif" kabul edilir.
				</p>
			</header>

			<CareerManager
				initial={experiences.map((e) => ({
					id: e.id,
					companyName: e.companyName,
					roleTr: e.roleTr,
					roleEn: e.roleEn,
					descTr: e.descTr,
					descEn: e.descEn,
					startDate: e.startDate.toISOString().slice(0, 10),
					endDate: e.endDate ? e.endDate.toISOString().slice(0, 10) : "",
					order: e.order,
				}))}
			/>
		</div>
	);
}
