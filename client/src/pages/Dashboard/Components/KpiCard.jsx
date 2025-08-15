import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';

export default function KpiCard({ title, value, delta, children }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			className='p-4 rounded-2xl bg-background dark:bg-input shadow'
		>
			<div className='flex justify-between items-start'>
				<div>
					<div className='text-sm text-muted-foreground'>{title}</div>
					<div className='text-2xl font-semibold'>{value}</div>
				</div>
				{typeof delta !== 'undefined' && (
					<div
						className={`text-sm ${
							delta >= 0 ? 'text-green-600' : 'text-red-600'
						}`}
					>
						{delta >= 0 ? `+${delta}%` : `${delta}%`}
					</div>
				)}
			</div>
			{children && <div className='mt-3'>{children}</div>}
		</motion.div>
	);
}
