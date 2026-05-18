"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
	useEffect(() => {
		console.error("Global error boundary:", error);
	}, [error]);

	return (
		<div className="container mx-auto px-4 py-24 md:py-32 max-w-xl animate-fade-in text-center">
			<div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-6">
				<AlertCircle className="h-10 w-10" strokeWidth={1.5} />
			</div>
			<h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
				Bir şeyler ters gitti
			</h1>
			<p className="text-muted-foreground mt-2">
				Sayfa yüklenirken beklenmedik bir hata oluştu. Lütfen tekrar dene.
			</p>
			{error.digest && (
				<p className="text-[11px] text-muted-foreground/70 mt-3 font-mono">
					Hata kodu: {error.digest}
				</p>
			)}
			<div className="flex flex-wrap items-center justify-center gap-3 mt-8">
				<Button onClick={reset}>
					<RotateCcw /> Tekrar dene
				</Button>
				<Button asChild variant="outline">
					<Link href="/">
						<Home /> Anasayfa
					</Link>
				</Button>
			</div>
		</div>
	);
}
