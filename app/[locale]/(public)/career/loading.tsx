// Career loading skeleton — grouped company cards
export default function CareerLoading() {
	return (
		<div className="container mx-auto px-4 py-12 md:py-20 max-w-3xl animate-pulse">
			<div className="h-10 w-40 rounded-lg bg-muted mb-10" />

			<ol className="space-y-4">
				{[
					{ positions: 1 },
					{ positions: 1 },
					{ positions: 3 },
					{ positions: 1 },
				].map((g, gi) => (
					<li key={gi}>
						<div className="rounded-xl border bg-card p-6">
							<header className="flex items-start gap-3 mb-4">
								<div className="h-10 w-10 rounded-lg bg-muted shrink-0" />
								<div className="min-w-0 flex-1 space-y-2">
									<div className="h-4 w-48 rounded bg-muted" />
									<div className="h-3 w-32 rounded bg-muted" />
								</div>
							</header>
							<ol className="border-s border-border ml-5 space-y-5">
								{[...Array(g.positions)].map((_, pi) => (
									<li key={pi} className="ms-5 space-y-1">
										<div className="h-3 w-32 rounded bg-muted" />
										<div className="h-4 w-40 rounded bg-muted" />
										<div className="h-3 w-full rounded bg-muted" />
										<div className="h-3 w-4/5 rounded bg-muted" />
									</li>
								))}
							</ol>
						</div>
					</li>
				))}
			</ol>
		</div>
	);
}
