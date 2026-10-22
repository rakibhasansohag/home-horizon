import {
	ResponsiveContainer,
	AreaChart,
	Area,
	XAxis,
	Tooltip,
	YAxis,
	CartesianGrid,
} from 'recharts';

function ChartTip({ active, payload, label }) {
	if (!active || !payload?.length) return null;
	return (
		<div className='rounded-md border border-border bg-surface px-3 py-2 text-sm shadow-sm'>
			<p className='font-medium text-foreground'>{label}</p>
			<p className='mt-1 tabular-nums text-brand'>
				৳{Number(payload[0].value || 0).toLocaleString()}
			</p>
		</div>
	);
}

export default function RevenueChart({ data = [] }) {
	return (
		<ResponsiveContainer width='100%' height='100%'>
			<AreaChart data={data} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
				<CartesianGrid vertical={false} stroke='var(--line)' />
				<XAxis
					dataKey='month'
					tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
					axisLine={false}
					tickLine={false}
				/>
				<YAxis
					axisLine={false}
					tickLine={false}
					tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
					tickFormatter={(value) =>
						value >= 1000 ? `${Math.round(value / 1000)}k` : value
					}
				/>
				<Tooltip
					content={<ChartTip />}
					allowEscapeViewBox={{ x: false, y: false }}
				/>
				<Area
					type='monotone'
					dataKey='value'
					stroke='var(--brand)'
					fill='var(--brand)'
					fillOpacity={0.18}
					strokeWidth={2}
				/>
			</AreaChart>
		</ResponsiveContainer>
	);
}
