import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function Sparkline({
	data = [],
	dataKey = 'value',
	height = 60,
}) {
	return (
		<div style={{ height }}>
			<ResponsiveContainer>
				<LineChart data={data}>
					<Line dataKey={dataKey} dot={false} strokeWidth={2} />
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
