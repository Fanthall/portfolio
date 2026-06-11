// Contact loading skeleton — form + sidebar
export default function ContactLoading() {
	return (
		<div className="container mx-auto px-4 py-12 md:py-20 max-w-3xl animate-pulse">
			<div className="h-10 w-32 rounded-lg bg-muted mb-2" />
			<div className="h-4 w-2/3 rounded bg-muted mb-10" />

			<div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-10">
				{/* Form */}
				<div className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<div className="h-3 w-20 rounded bg-muted" />
							<div className="h-9 w-full rounded-md bg-muted" />
						</div>
						<div className="space-y-2">
							<div className="h-3 w-16 rounded bg-muted" />
							<div className="h-9 w-full rounded-md bg-muted" />
						</div>
					</div>
					<div className="space-y-2">
						<div className="h-3 w-12 rounded bg-muted" />
						<div className="h-9 w-full rounded-md bg-muted" />
					</div>
					<div className="space-y-2">
						<div className="h-3 w-14 rounded bg-muted" />
						<div className="h-36 w-full rounded-md bg-muted" />
					</div>
					<div className="h-9 w-28 rounded-md bg-muted" />
				</div>

				{/* Sidebar */}
				<aside className="space-y-3">
					<div className="h-3 w-32 rounded bg-muted" />
					<div className="space-y-2">
						{[...Array(4)].map((_, i) => (
							<div key={i} className="h-5 w-40 rounded bg-muted" />
						))}
					</div>
				</aside>
			</div>
		</div>
	);
}
