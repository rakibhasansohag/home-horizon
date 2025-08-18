import React from 'react';
import {
	ResponsiveContainer,
	LineChart,
	Line,
	XAxis,
	Tooltip,
	YAxis,
	CartesianGrid,
} from 'recharts';

export default function RevenueChart({ data = [] }) {
	// ensure data shape [{month, value}]
	return (
		<ResponsiveContainer width='100%' height='100%'>
			<LineChart data={data}>
				<CartesianGrid strokeDasharray='3 3' opacity={0.06} />
				<XAxis dataKey='month' tick={{ fill: 'var(--muted-foreground)' }} />
				<YAxis tickFormatter={(v) => (v ? (v / 1000).toFixed(0) + 'k' : '0')} />
				<Tooltip formatter={(v) => `$${Number(v || 0).toLocaleString()}`} />
				<Line
					type='monotone'
					dataKey='value'
					stroke='var(--color-chart-1)'
					strokeWidth={2}
					dot={false}
				/>
			</LineChart>
		</ResponsiveContainer>
	);
}
