"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export function LanguageToggle() {
	const locale = useLocale() as Locale;
	const t = useTranslations("common");
	const router = useRouter();
	const pathname = usePathname();
	const [isPending, startTransition] = useTransition();

	const next: Locale = locale === "tr" ? "en" : "tr";

	return (
		<button
			type="button"
			className="iconbtn"
			disabled={isPending}
			aria-label={`${t("language")} — ${next.toUpperCase()}`}
			title={`${locale.toUpperCase()} → ${next.toUpperCase()}`}
			onClick={() =>
				startTransition(() => {
					router.replace(pathname, { locale: next });
					router.refresh();
				})
			}
		>
			{locale.toUpperCase()}
		</button>
	);
}
