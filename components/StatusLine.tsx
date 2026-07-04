"use client";

import { useEffect, useState } from "react";

interface StatusLineProps {
	availableLabel: string;
	remoteLabel: string;
}

/** Prototip .status — müsaitlik noktası + yerel saat (mono). */
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
		<span className="status">
			<span className="dot" aria-hidden />
			{availableLabel} · {remoteLabel}
			{time && (
				<span suppressHydrationWarning>
					{" "}
					· {time}
				</span>
			)}
		</span>
	);
}
