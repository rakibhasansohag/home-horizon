import React from 'react';

export default function StatCard({ title, value, subtitle }) {
	return (
		<div className='bg-card rounded-xl p-4 shadow-md'>
			<p className='text-sm text-muted-foreground'>{title}</p>
			<div className='text-2xl font-bold mt-2'>{value}</div>
			{subtitle && (
				<div className='text-xs text-muted-foreground mt-1'>{subtitle}</div>
			)}
		</div>
	);
}
