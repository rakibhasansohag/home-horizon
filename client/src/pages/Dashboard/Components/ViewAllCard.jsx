import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

export default function ViewAllCard({
	to = '#',
	count = 0,
	label = 'View all listings',
	showCount = 0,
}) {
	return (
		<Link
			to={to}
			className='mt-4 flex min-h-14 items-center justify-between gap-3 rounded-lg border border-border px-4 transition-colors duration-200 hover:border-brand'
			aria-label={label}
		>
			<span>
				<span className='font-medium text-foreground'>{label}</span>
				<span className='mt-0.5 block text-sm text-muted-foreground'>
					{count > 0
						? `Showing ${showCount} of ${count}`
						: 'Open the full list'}
				</span>
			</span>
			<ArrowRight className='size-4 shrink-0 text-brand' aria-hidden='true' />
		</Link>
	);
}
