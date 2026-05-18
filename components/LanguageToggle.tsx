"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { setLocale } from "@/app/actions/preferences";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/request";

export function LanguageToggle() {
	const locale = useLocale() as Locale;
	const t = useTranslations("common");
	const [isPending, startTransition] = useTransition();

	const next: Locale = locale === "tr" ? "en" : "tr";

	return (
		<Button
			size="sm"
			variant="ghost"
			disabled={isPending}
			aria-label={t("language")}
			onClick={() => startTransition(() => setLocale(next))}
		>
			<span className="font-semibold">{locale.toUpperCase()}</span>
			<span className="text-muted-foreground">/ {next.toUpperCase()}</span>
		</Button>
	);
}
