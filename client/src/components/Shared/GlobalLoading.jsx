import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';

export default function GlobalLoading() {
	return (
		<div className='fixed inset-0 bg-background dark:bg-background/80 flex items-center justify-center z-50'>
			<motion.div
				initial={{ scale: 0.8, opacity: 0 }}
				animate={{ scale: [0.8, 1.1, 0.9, 1], opacity: 1 }}
				transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
				className='flex flex-col items-center'
			>
				{/* House illustration: roof + walls */}
				<motion.svg
					width='100'
					height='100'
					viewBox='0 0 100 100'
					initial={{ pathLength: 0 }}
					animate={{ pathLength: 1 }}
					transition={{ duration: 1, ease: 'easeInOut' }}
					className='mb-4'
				>
					{/* Roof */}
					<motion.path
						d='M10 50 L50 10 L90 50 Z'
						stroke='hsl(var(--primary))'
						fill='none'
						strokeWidth='4'
					/>
					{/* Walls */}
					<motion.rect
						x='25'
						y='50'
						width='50'
						height='40'
						stroke='hsl(var(--primary))'
						fill='none'
						strokeWidth='4'
						initial={{ opacity: 0 }}
						animate={{ opacity: [0, 1] }}
						transition={{ delay: 0.8, duration: 0.5 }}
					/>
					{/* Door */}
					<motion.rect
						x='45'
						y='70'
						width='10'
						height='20'
						fill='hsl(var(--primary))'
						initial={{ scaleY: 0 }}
						animate={{ scaleY: [0, 1] }}
						transformOrigin='center bottom'
						transition={{ delay: 1.3, duration: 0.4 }}
					/>
				</motion.svg>

				{/* Loading dots */}
				<motion.div
					className='flex space-x-2'
					initial={{ opacity: 0.5 }}
					animate={{ opacity: [0.5, 1, 0.5] }}
					transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
				>
					<span className='w-3 h-3 rounded-full bg-primary'></span>
					<span className='w-3 h-3 rounded-full bg-primary'></span>
					<span className='w-3 h-3 rounded-full bg-primary'></span>
				</motion.div>
			</motion.div>
		</div>
	);
}
