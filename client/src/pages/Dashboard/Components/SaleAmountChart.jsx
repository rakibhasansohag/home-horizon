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
	return text.length > 16 ? `${text.slice(0, 14)}…` : text;
}

function ChartTip({ active, payload }) {
	if (!active || !payload?.length) return null;
	const row = payload[0]?.payload || {};
	return (
		<div className='max-w-56 rounded-md border border-border bg-surface px-3 py-2 text-sm shadow-sm'>
			<p className='font-medium leading-snug text-foreground'>{row.label}</p>
			<p className='mt-1 tabular-nums text-brand'>
				৳{Number(row.value || 0).toLocaleString()}
			</p>
		</div>
	);
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
				margin={{ left: 0, right: 8, top: 4, bottom: 0 }}
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
					width={108}
					axisLine={false}
					tickLine={false}
					tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
					tickFormatter={shortLabel}
				/>
				<Tooltip
					content={<ChartTip />}
					cursor={{ fill: 'var(--paper)' }}
					allowEscapeViewBox={{ x: false, y: false }}
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
