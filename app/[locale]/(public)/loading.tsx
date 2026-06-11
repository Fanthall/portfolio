// Home loading skeleton — hero + featured projects
export default function HomeLoading() {
	return (
		<div className="container mx-auto px-4 py-12 md:py-20 animate-pulse">
			{/* Hero */}
			<section className="grid grid-cols-1 md:grid-cols-2 items-center gap-10">
				<div className="space-y-4">
					<div className="h-10 md:h-12 w-3/4 rounded-lg bg-muted" />
					<div className="h-5 w-1/2 rounded bg-muted" />
					<div className="h-8 w-64 rounded-full bg-muted" />
					<div className="space-y-2 pt-2">
						<div className="h-4 w-full rounded bg-muted" />
						<div className="h-4 w-11/12 rounded bg-muted" />
						<div className="h-4 w-4/5 rounded bg-muted" />
					</div>
					<div className="flex gap-3 pt-2">
						<div className="h-9 w-32 rounded-md bg-muted" />
						<div className="h-9 w-24 rounded-md bg-muted" />
					</div>
				</div>
				<div className="flex justify-center md:justify-end">
					<div className="h-64 w-64 md:h-80 md:w-80 rounded-full bg-muted" />
				</div>
			</section>

			{/* Featured projects */}
			<section className="mt-20">
				<div className="flex items-end justify-between mb-6">
					<div className="h-8 w-40 rounded bg-muted" />
					<div className="h-7 w-32 rounded bg-muted" />
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{[...Array(3)].map((_, i) => (
						<div key={i} className="rounded-xl border bg-card p-6 space-y-3">
							<div className="h-5 w-3/4 rounded bg-muted" />
							<div className="space-y-1.5">
								<div className="h-3 w-full rounded bg-muted" />
								<div className="h-3 w-5/6 rounded bg-muted" />
							</div>
							<div className="h-4 w-28 rounded bg-muted" />
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
