// Project detail skeleton — header + content + demo
export default function ProjectDetailLoading() {
	return (
		<div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl animate-pulse">
			{/* Back button */}
			<div className="h-8 w-32 rounded-md bg-muted mb-6" />

			{/* Header */}
			<header className="space-y-3">
				<div className="h-10 md:h-12 w-2/3 rounded-lg bg-muted" />
				<div className="space-y-2">
					<div className="h-5 w-full rounded bg-muted" />
					<div className="h-5 w-4/5 rounded bg-muted" />
				</div>
				<div className="h-8 w-28 rounded-md bg-muted" />
			</header>

			{/* Description */}
			<section className="mt-10 space-y-2">
				{[...Array(5)].map((_, i) => (
					<div
						key={i}
						className={`h-4 rounded bg-muted ${i === 4 ? "w-3/5" : "w-full"}`}
					/>
				))}
			</section>

			{/* Demo area placeholder */}
			<section className="mt-10">
				<div className="aspect-video w-full rounded-xl bg-muted" />
			</section>
		</div>
	);
}
