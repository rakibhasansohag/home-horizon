import { Link } from 'react-router';
import { FaArrowRight, FaTh } from 'react-icons/fa';

export default function ViewAllCard({
	to = '#',
	count = 0,
	label = 'View all listings',
	showCount = 0,
}) {
	return (
		<Link
			to={to}
			className='group block bg-card rounded-xl shadow-lg border border-border/50 overflow-hidden h-full transition-transform duration-300 hover:-translate-y-1'
			aria-label={label}
		>
			<div className='p-6 h-full flex flex-col items-center justify-center text-center'>
				<div className='flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4 transition-transform duration-300 group-hover:scale-105'>
					<FaTh className='w-6 h-6' />
				</div>

				<h4 className='text-lg font-semibold text-foreground mb-2'>{label}</h4>

				<p className='text-sm text-muted-foreground'>
					{count > 0
						? `Showing ${showCount} — ${count} total`
						: 'No more items'}
				</p>

				<div className='mt-4 inline-flex items-center gap-2 text-primary font-medium'>
					<span>Open</span>
					<FaArrowRight />
				</div>
			</div>
		</Link>
	);
}
