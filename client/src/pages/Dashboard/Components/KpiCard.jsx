export default function KpiCard({ title, value, delta, children }) {
	return (
		<div className='rounded-lg border border-border bg-surface p-4'>
			<div className='flex items-start justify-between'>
				<div>
					<div className='text-sm text-muted-foreground'>{title}</div>
					<div className='text-2xl font-semibold tabular-nums'>{value}</div>
				</div>
				{typeof delta !== 'undefined' && (
					<div
						className={`text-sm ${
							delta >= 0 ? 'text-success' : 'text-danger'
						}`}
					>
						{delta >= 0 ? `+${delta}%` : `${delta}%`}
					</div>
				)}
			</div>
			{children && <div className='mt-3'>{children}</div>}
		</div>
	);
}
