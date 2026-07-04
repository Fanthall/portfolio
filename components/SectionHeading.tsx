import { Link } from "@/i18n/navigation";

interface SectionHeadingProps {
	num: string;
	label: string;
	title: string;
	more?: { href: string; label: string };
}

/** Prototip .sec-head — mono numara + display başlık + opsiyonel "→" link. */
export function SectionHeading({ num, label, title, more }: SectionHeadingProps) {
	return (
		<div className="sec-head">
			<div>
				<span className="num">
					{num} — {label}
				</span>
				<h2>{title}</h2>
			</div>
			{more && (
				<Link href={more.href} className="more">
					{more.label} →
				</Link>
			)}
		</div>
	);
}
