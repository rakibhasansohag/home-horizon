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

	return (
		<article className='flex h-full flex-col gap-3 rounded-lg border border-border bg-surface p-4 transition-colors duration-200 hover:border-brand'>
			<div className='flex items-center gap-3'>
				<Avatar>
					<AvatarImage src={review.userImage} alt='' />
					<AvatarFallback>{review.userName?.[0]}</AvatarFallback>
				</Avatar>
				<div className='min-w-0'>
					<p className='truncate font-medium'>{review.userName || 'Anonymous'}</p>
					<p className='truncate text-sm text-muted-foreground'>
						{review.userEmail || 'N/A'}
					</p>
				</div>
			</div>

			<div>
				<p className='flex items-center gap-1'>
					<span className='sr-only'>
						{Number.isFinite(Number(review.rating))
							? `${review.rating} out of 5`
							: 'No rating'}
					</span>
					{stars}
				</p>
				<p className='mt-2 text-base text-foreground'>{review.reviewText}</p>
			</div>

			<p className='mt-auto text-right text-sm text-muted-foreground'>
				Reviewed on {new Date(review.createdAt).toLocaleDateString()}
			</p>
		</article>
	);
}
