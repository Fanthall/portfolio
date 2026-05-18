export default function AdminLoading() {
	return (
		<div className="p-8 max-w-5xl animate-pulse space-y-8">
			<div className="space-y-2">
				<div className="h-6 w-40 rounded-md bg-muted" />
				<div className="h-4 w-72 rounded bg-muted" />
			</div>
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				{[...Array(4)].map((_, i) => (
					<div key={i} className="h-28 rounded-xl border bg-card p-5">
						<div className="h-3 w-16 rounded bg-muted" />
						<div className="h-8 w-12 rounded bg-muted mt-4" />
					</div>
				))}
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
				<div className="h-64 rounded-xl border bg-card" />
				<div className="h-64 rounded-xl border bg-card" />
			</div>
		</div>
	);
}
