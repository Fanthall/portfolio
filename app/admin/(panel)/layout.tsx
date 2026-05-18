import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
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

	const unreadCount = await prisma.contactMessage.count({ where: { isRead: false } });

	return (
		<div className="min-h-screen bg-background">
			<AdminSidebar email={admin.email} unreadCount={unreadCount} />
			<main className="md:ml-60">{children}</main>
		</div>
	);
}
