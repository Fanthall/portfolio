import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
	robots: {
		index: false,
		follow: false,
		nocache: true,
		googleBot: { index: false, follow: false },
	},
};

export default async function AdminPanelLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const admin = await getCurrentAdmin();
	if (!admin) redirect("/admin/login");

	const supabase = createSupabaseAdminClient();
	const { count } = await supabase
		.from("contact_message")
		.select("*", { count: "exact", head: true })
		.eq("is_read", false);
	const unreadCount = count ?? 0;

	return (
		<div className="min-h-screen bg-background">
			<AdminSidebar email={admin.email} unreadCount={unreadCount} />
			<main className="md:ml-60">{children}</main>
		</div>
	);
}
