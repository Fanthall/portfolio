"use client";

import { Moon, Sun } from "lucide-react";
import { useTransition } from "react";
import { setTheme } from "@/app/actions/preferences";

interface ThemeToggleProps {
	current: "light" | "dark";
}

export function ThemeToggle({ current }: ThemeToggleProps) {
	const [isPending, startTransition] = useTransition();
	const next = current === "dark" ? "light" : "dark";

	return (
		<button
			type="button"
			className="iconbtn"
			disabled={isPending}
			aria-label={`Switch to ${next} mode`}
			onClick={() => startTransition(() => setTheme(next))}
		>
			{current === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
		</button>
	);
}
