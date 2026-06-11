// Projects list skeleton — card grid
export default function ProjectsLoading() {
	return (
		<div className="container mx-auto px-4 py-12 md:py-20 animate-pulse">
			<div className="h-10 w-40 rounded-lg bg-muted mb-10" />

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{[...Array(6)].map((_, i) => (
					<div key={i} className="rounded-xl border bg-card overflow-hidden">
						<div className="aspect-video w-full bg-muted" />
						<div className="p-6 space-y-3">
							<div className="h-5 w-3/4 rounded bg-muted" />
							<div className="space-y-1.5">
								<div className="h-3 w-full rounded bg-muted" />
								<div className="h-3 w-5/6 rounded bg-muted" />
								<div className="h-3 w-2/3 rounded bg-muted" />
							</div>
							<div className="flex gap-2 pt-2">
								<div className="h-8 w-24 rounded-md bg-muted" />
								<div className="h-8 w-20 rounded-md bg-muted" />
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
