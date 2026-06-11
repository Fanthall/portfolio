"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

export function LanguageToggle() {
	const locale = useLocale() as Locale;
	const t = useTranslations("common");
	const router = useRouter();
	const pathname = usePathname();
	const [isPending, startTransition] = useTransition();

	const next: Locale = locale === "tr" ? "en" : "tr";

	return (
		<Button
			size="sm"
			variant="ghost"
			disabled={isPending}
			aria-label={t("language")}
			onClick={() =>
				startTransition(() => {
					router.replace(pathname, { locale: next });
					// Root layout'taki <html lang> server'da render ediliyor;
					// soft navigasyonda yenilenmesi için refresh gerekli.
					router.refresh();
				})
			}
		>
			<span className="font-semibold">{locale.toUpperCase()}</span>
			<span className="text-muted-foreground">/ {next.toUpperCase()}</span>
		</Button>
	);
}
