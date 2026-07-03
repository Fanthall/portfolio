import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

interface SectionHeadingProps {
	/** Mono bölüm numarası, ör. "01" */
	num: string;
	/** Mono bölüm etiketi, ör. "Seçili işler" */
	label: string;
	/** Büyük display başlık */
	title: string;
	/** Opsiyonel sağ üst "daha fazla" linki (iç rota) */
	more?: { href: string; label: string };
}

/**
 * Numaralı editöryel bölüm başlığı (Studio Ink imza öğesi):
 *   01 — SEÇİLİ İŞLER            tüm projeler →
 *   Büyük display başlık
 * Hairline alt ayraç ile.
 */
export function SectionHeading({ num, label, title, more }: SectionHeadingProps) {
	return (
		<div className="mb-8 flex items-end justify-between gap-4 border-b border-border pb-3.5">
			<div>
				<span className="section-num">
					{num} — {label}
				</span>
				<h2 className="mt-1.5 font-display text-2xl font-semibold tracking-tight md:text-[2rem] md:leading-[1.1]">
					{title}
				</h2>
			</div>
			{more && (
				<Link
					href={more.href}
					className="group inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b border-transparent pb-0.5 font-mono text-[0.78rem] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
				>
					{more.label}
					<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
				</Link>
			)}
		</div>
	);
}
