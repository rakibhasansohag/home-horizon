import {
	ResponsiveContainer,
	AreaChart,
	Area,
	XAxis,
	Tooltip,
	YAxis,
	CartesianGrid,
} from 'recharts';

export default function RevenueChart({ data = [] }) {
	return (
		<ResponsiveContainer width='100%' height='100%'>
			<AreaChart data={data}>
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
				<Tooltip formatter={(value) => `৳${Number(value || 0).toLocaleString()}`} />
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
