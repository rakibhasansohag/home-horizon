import React from 'react';

export default function StatCard({ title, value, subtitle }) {
	return (
		<div className='rounded-lg border border-border bg-surface p-4'>
			<p className='text-sm text-muted-foreground'>{title}</p>
			<div className='mt-2 text-2xl font-semibold tabular-nums'>{value}</div>
			{subtitle && (
				<div className='mt-1 text-sm text-muted-foreground'>{subtitle}</div>
			)}
		</div>
	);
}
