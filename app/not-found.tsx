import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
	title: "404 — Sayfa bulunamadı",
	robots: { index: false, follow: false },
};

export default function NotFound() {
	return (
		<div className="container mx-auto px-4 py-24 md:py-32 max-w-xl animate-fade-in text-center">
			<div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
				<Search className="h-10 w-10" strokeWidth={1.5} />
			</div>
			<p className="text-6xl md:text-7xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/40 bg-clip-text text-transparent">
				404
			</p>
			<h1 className="text-2xl md:text-3xl font-semibold tracking-tight mt-4">
				Sayfa bulunamadı
			</h1>
			<p className="text-muted-foreground mt-2">
				Aradığın sayfa kaldırılmış veya hiç var olmamış olabilir.
			</p>
			<div className="flex flex-wrap items-center justify-center gap-3 mt-8">
				<Button asChild>
					<Link href="/">
						<Home /> Anasayfa
					</Link>
				</Button>
				<Button asChild variant="outline">
					<Link href="/projects">Projeler</Link>
				</Button>
			</div>
		</div>
	);
}
