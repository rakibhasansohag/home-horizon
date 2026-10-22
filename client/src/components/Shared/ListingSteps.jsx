import { cn } from '@/lib/utils';

export default function ListingSteps({ steps, step, onStep }) {
	return (
		<ol
			className={cn(
				'grid grid-cols-2 gap-2',
				steps.length > 3 ? 'sm:grid-cols-5' : 'sm:grid-cols-3',
			)}
		>
			{steps.map((label, index) => {
				const current = index === step;
				const done = index < step;
				return (
					<li key={label}>
						<button
							type='button'
							disabled={!done}
							onClick={() => onStep(index)}
							aria-current={current ? 'step' : undefined}
							className={cn(
								'flex min-h-11 w-full items-center gap-2 rounded-md border px-3 text-left text-sm',
								current
									? 'border-brand bg-brand-soft font-medium text-brand'
									: 'border-border bg-surface text-foreground',
								done && 'cursor-pointer hover:border-brand',
							)}
						>
							<span className='tabular-nums'>{index + 1}</span>
							<span className='truncate'>{label}</span>
						</button>
					</li>
				);
			})}
		</ol>
	);
}
