import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
	title: "Admin Login",
	robots: {
		index: false,
		follow: false,
		nocache: true,
		googleBot: { index: false, follow: false },
	},
};

interface PageProps {
	searchParams: Promise<{ from?: string }>;
}

export default async function AdminLoginPage({ searchParams }: PageProps) {
	const { from } = await searchParams;
	const redirectTo = from && from.startsWith("/admin") && from !== "/admin/login" ? from : "/admin";

	return (
		<div className="min-h-screen flex items-center justify-center px-4 bg-background">
			<div className="w-full max-w-sm">
				<div className="mb-6 text-center">
					<h1 className="text-2xl font-bold tracking-tight">Admin</h1>
					<p className="text-sm text-muted-foreground mt-1">Portfolio yönetimi</p>
				</div>
				<LoginForm redirectTo={redirectTo} />
			</div>
		</div>
	);
}
