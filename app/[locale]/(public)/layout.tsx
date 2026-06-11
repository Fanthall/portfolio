import { cookies } from "next/headers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const THEME_COOKIE = "theme";

export default async function PublicLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const cookieStore = await cookies();
	const theme = cookieStore.get(THEME_COOKIE)?.value === "light" ? "light" : "dark";

	return (
		<div className="flex min-h-screen flex-col">
			<Header theme={theme} />
			<main className="flex-1">{children}</main>
			<Footer />
		</div>
	);
}
