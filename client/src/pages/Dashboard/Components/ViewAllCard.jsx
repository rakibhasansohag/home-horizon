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
			className='flex h-full flex-col justify-center rounded-lg border border-border bg-surface p-6 transition-colors duration-200 hover:border-brand hover:bg-brand-soft'
			aria-label={label}
		>
			<h4 className='text-lg font-semibold text-foreground'>{label}</h4>
			<p className='mt-2 text-sm text-muted-foreground'>
				{count > 0 ? `Showing ${showCount} of ${count}` : 'No more items'}
			</p>
			<span className='mt-4 inline-flex items-center gap-2 font-medium text-brand'>
				Open
				<ArrowRight className='size-4' />
			</span>
		</Link>
	);
}
