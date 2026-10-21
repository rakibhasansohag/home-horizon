import {
	ResponsiveContainer,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
} from 'recharts';

export default function MonthlyBarChart({ data = [], money = true }) {
	const rows = (data || []).map((item) => ({
		label: item.label || item.month || '',
		value: Number(item.value || 0),
	}));

	return (
		<ResponsiveContainer width='100%' height='100%'>
			<BarChart data={rows} barSize={28}>
				<CartesianGrid vertical={false} stroke='var(--line)' />
				<XAxis
					dataKey='label'
					tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
					axisLine={false}
					tickLine={false}
					tickFormatter={(label) => {
						const text = String(label || '');
						return text.length > 12 ? `${text.slice(0, 10)}…` : text;
					}}
				/>
				<YAxis
					width={40}
					axisLine={false}
					tickLine={false}
					tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
					tickFormatter={(value) =>
						value >= 1000 ? `${Math.round(value / 1000)}k` : value
					}
				/>
				<Tooltip
					cursor={{ fill: 'var(--paper)' }}
					formatter={(value) =>
						money
							? `৳${Number(value || 0).toLocaleString()}`
							: Number(value || 0).toLocaleString()
					}
				/>
				<Bar dataKey='value' fill='var(--brand)' radius={[4, 4, 0, 0]} />
			</BarChart>
		</ResponsiveContainer>
	);
}
