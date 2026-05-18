import { prisma } from "@/lib/db";
import { MessagesList } from "@/components/admin/MessagesList";

export const metadata = { title: "Mesajlar — Admin" };

export default async function AdminMessagesPage() {
	const messages = await prisma.contactMessage.findMany({
		orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
	});

	const unreadCount = messages.filter((m) => !m.isRead).length;

	return (
		<div className="p-8 max-w-4xl">
			<header className="mb-8 flex items-end justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Mesajlar</h1>
					<p className="text-sm text-muted-foreground mt-1">
						İletişim formundan gelen mesajlar. {unreadCount > 0 && `${unreadCount} okunmamış.`}
					</p>
				</div>
			</header>

			<MessagesList
				initial={messages.map((m) => ({
					id: m.id,
					name: m.name,
					email: m.email,
					subject: m.subject ?? "",
					body: m.body,
					isRead: m.isRead,
					createdAt: m.createdAt.toISOString(),
				}))}
			/>
		</div>
	);
}
