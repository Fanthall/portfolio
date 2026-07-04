"use client";

import { useTransition } from "react";
import { setTheme } from "@/app/actions/preferences";

interface ThemeToggleProps {
	current: "light" | "dark";
}

/** Prototip tema düğmesi — ◐ (light) / ◑ (dark) daire glifi. */
export function ThemeToggle({ current }: ThemeToggleProps) {
	const [isPending, startTransition] = useTransition();
	const next = current === "dark" ? "light" : "dark";

	return (
		<button
			type="button"
			className="iconbtn"
			disabled={isPending}
			aria-label={`Switch to ${next} mode`}
			title={`${next} mode`}
			style={{ fontSize: "1.1rem", lineHeight: 1 }}
			onClick={() => startTransition(() => setTheme(next))}
		>
			{current === "light" ? "◐" : "◑"}
		</button>
	);
}
