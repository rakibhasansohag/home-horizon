import {
	ResponsiveContainer,
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
} from 'recharts';

function EarningsChart({ data }) {
	const chartData = (data || []).map((d) => ({
		month: d.month,
		value: Number(d.value || 0),
	}));

	return (
		<ResponsiveContainer width='100%' height={160}>
			<LineChart data={chartData}>
				<CartesianGrid strokeDasharray='3 3' opacity={0.06} />
				<XAxis dataKey='month' tick={{ fontSize: 12 }} />
				<YAxis
					tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)}
				/>
				<Tooltip formatter={(value) => value?.toLocaleString?.() || value} />
				<Line
					type='monotone'
					dataKey='value'
					strokeWidth={2}
					dot={false}
					strokeLinecap='round'
				/>
			</LineChart>
		</ResponsiveContainer>
	);
}

export default EarningsChart;
