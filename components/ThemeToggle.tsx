"use client";

import { Moon, Sun } from "lucide-react";
import { useTransition } from "react";
import { setTheme } from "@/app/actions/preferences";
import { Button } from "@/components/ui/button";

interface ThemeToggleProps {
	current: "light" | "dark";
}

export function ThemeToggle({ current }: ThemeToggleProps) {
	const [isPending, startTransition] = useTransition();
	const next = current === "dark" ? "light" : "dark";

	return (
		<Button
			size="icon"
			variant="ghost"
			disabled={isPending}
			aria-label={`Switch to ${next} mode`}
			onClick={() => startTransition(() => setTheme(next))}
		>
			{current === "dark" ? <Sun /> : <Moon />}
		</Button>
	);
}
