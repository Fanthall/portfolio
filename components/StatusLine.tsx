"use client";

import { useEffect, useState } from "react";

interface StatusLineProps {
	availableLabel: string;
	remoteLabel: string;
}

/**
 * Hero "durum satırı" — müsaitlik + yerel saat (mono). Studio Ink imza öğesi.
 * Saat client'ta güncellenir; SSR/hydration uyuşmazlığı olmasın diye ilk
 * render'da boş, mount sonrası dolar.
 */
export function StatusLine({ availableLabel, remoteLabel }: StatusLineProps) {
	const [time, setTime] = useState<string>("");

	useEffect(() => {
		const tick = () => {
			const d = new Date();
			setTime(
				`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
			);
		};
		tick();
		const id = setInterval(tick, 10_000);
		return () => clearInterval(id);
	}, []);

	return (
		<span className="inline-flex items-center gap-2.5 rounded-full border border-border bg-card px-3.5 py-1.5 font-mono text-xs text-muted-foreground">
			<span className="relative flex h-2 w-2" aria-hidden>
				<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-70" />
				<span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
			</span>
			<span>{availableLabel}</span>
			<span aria-hidden>·</span>
			<span>{remoteLabel}</span>
			{time && (
				<>
					<span aria-hidden>·</span>
					<span suppressHydrationWarning>{time}</span>
				</>
			)}
		</span>
	);
}
