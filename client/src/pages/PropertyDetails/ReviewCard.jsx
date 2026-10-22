import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

export default function ReviewCard({ review }) {
	const stars = Array.from({ length: 5 }, (_, i) => (
		<Star
			key={i}
			aria-hidden='true'
			className={`size-4 ${
				i < review.rating ? 'fill-warning text-warning' : 'text-line'
			}`}
		/>
	));
	const date = review.createdAt ? new Date(review.createdAt) : null;
	const when =
		date && !Number.isNaN(date.getTime())
			? date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
			: '';

	return (
		<article className='flex h-full flex-col gap-3 rounded-lg border border-border bg-surface p-4'>
			<div className='flex items-center gap-3'>
				<Avatar>
					<AvatarImage src={review.userImage} alt='' />
					<AvatarFallback>{review.userName?.[0] || '?'}</AvatarFallback>
				</Avatar>
				<div className='min-w-0'>
					<p className='truncate font-medium'>{review.userName || 'Guest'}</p>
					{when ? (
						<p className='truncate text-sm text-muted-foreground'>{when}</p>
					) : null}
				</div>
			</div>
			<p className='flex items-center gap-1'>
				<span className='sr-only'>
					{Number.isFinite(Number(review.rating))
						? `${review.rating} out of 5`
						: 'No rating'}
				</span>
				{stars}
			</p>
			<p className='text-base text-foreground'>{review.reviewText}</p>
		</article>
	);
}
