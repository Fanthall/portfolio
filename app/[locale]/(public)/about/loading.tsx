// About loading skeleton — hero + skills grid
export default function AboutLoading() {
	return (
		<div className="container mx-auto px-4 py-12 md:py-20 animate-pulse">
			{/* Hero */}
			<section className="grid grid-cols-1 lg:grid-cols-[280px_1fr] items-start gap-10 lg:gap-16">
				<div className="flex justify-center lg:justify-start">
					<div className="h-56 w-56 md:h-64 md:w-64 lg:h-72 lg:w-72 rounded-3xl bg-muted" />
				</div>
				<div className="space-y-4">
					<div className="h-3 w-20 rounded bg-muted" />
					<div className="h-10 md:h-12 w-3/4 rounded-lg bg-muted" />
					<div className="space-y-2 pt-2">
						{[...Array(6)].map((_, i) => (
							<div key={i} className={`h-4 rounded bg-muted ${i === 5 ? "w-2/3" : "w-full"}`} />
						))}
					</div>
					<div className="flex flex-wrap gap-2 pt-3">
						{[...Array(4)].map((_, i) => (
							<div key={i} className="h-8 w-24 rounded-full bg-muted" />
						))}
					</div>
				</div>
			</section>

			{/* Skills */}
			<section className="mt-20">
				<div className="h-3 w-24 rounded bg-muted mb-6" />
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{[...Array(3)].map((_, i) => (
						<div key={i} className="rounded-xl border bg-card p-6 space-y-3">
							<div className="h-5 w-24 rounded bg-muted" />
							<div className="flex flex-wrap gap-2">
								{[...Array(5)].map((_, j) => (
									<div key={j} className="h-6 w-16 rounded-md bg-muted" />
								))}
							</div>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
