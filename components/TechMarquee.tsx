interface TechMarqueeProps {
	items: string[];
}

/**
 * Yeteneklerin yavaş kayan yatay şeridi (Studio Ink). Dekoratif → aria-hidden.
 * `prefers-reduced-motion: reduce` ile animasyon durur (globals.css). Kesintisiz
 * döngü için liste iki kez basılır ve %50 kaydırılır.
 */
export function TechMarquee({ items }: TechMarqueeProps) {
	if (items.length === 0) return null;
	const doubled = [...items, ...items];

	return (
		<div
			className="group overflow-hidden border-y border-border bg-card"
			aria-hidden
		>
			<div className="flex w-max animate-marquee whitespace-nowrap group-hover:[animation-play-state:paused]">
				{doubled.map((tech, i) => (
					<span
						key={`${tech}-${i}`}
						className="inline-flex items-center gap-7 px-7 py-4 font-mono text-sm text-muted-foreground"
					>
						<span className="text-[0.6rem] text-primary">◆</span>
						{tech}
					</span>
				))}
			</div>
		</div>
	);
}
