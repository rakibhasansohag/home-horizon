import {
	ResponsiveContainer,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
} from 'recharts';

function shortLabel(value) {
	const text = String(value || 'Sale');
	return text.length > 22 ? `${text.slice(0, 20)}…` : text;
}

export default function SaleAmountChart({ sales = [] }) {
	const rows = sales.map((sale) => ({
		label: sale.propertyTitle || 'Sale',
		value: Number(sale.amount || 0),
	}));

	return (
		<ResponsiveContainer width='100%' height='100%'>
			<BarChart
				data={rows}
				layout='vertical'
				margin={{ left: 8, right: 16, top: 4, bottom: 0 }}
			>
				<CartesianGrid horizontal={false} stroke='var(--line)' />
				<XAxis
					type='number'
					axisLine={false}
					tickLine={false}
					tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
					tickFormatter={(value) =>
						value >= 1000 ? `${Math.round(value / 1000)}k` : value
					}
				/>
				<YAxis
					type='category'
					dataKey='label'
					width={148}
					axisLine={false}
					tickLine={false}
					tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
					tickFormatter={shortLabel}
				/>
				<Tooltip
					cursor={{ fill: 'var(--paper)' }}
					formatter={(value) => [
						`৳${Number(value || 0).toLocaleString()}`,
						'Amount',
					]}
				/>
				<Bar
					dataKey='value'
					fill='var(--brand)'
					radius={[0, 4, 4, 0]}
					barSize={16}
				/>
			</BarChart>
		</ResponsiveContainer>
	);
}
