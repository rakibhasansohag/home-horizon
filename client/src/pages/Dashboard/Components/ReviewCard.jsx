import { Star } from 'lucide-react';
import { Link } from 'react-router';
import PersonAvatar from '@/components/Shared/PersonAvatar';
import { StripFrame } from './ListingStrip';

export default function ReviewCard({ review }) {
	const prop = review?.property || {};
	const created = review?.createdAt
		? new Date(review.createdAt).toLocaleDateString(undefined, {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
			})
		: '';
	const title = prop.title || review?.propertyTitle || '';

	return (
		<article className='flex min-h-36 overflow-hidden rounded-lg border border-border bg-surface'>
			<StripFrame
				to={review?.propertyId ? `/all-properties/${review.propertyId}` : ''}
				src={prop.image || review?.propertyImage}
				alt={title}
			/>
			<div className='flex min-w-0 flex-1 flex-col gap-1 p-4'>
				<div className='flex items-start justify-between gap-3'>
					{title && review?.propertyId ? (
						<Link
							to={`/all-properties/${review.propertyId}`}
							className='line-clamp-2 font-medium leading-snug transition-colors duration-200 hover:text-brand'
						>
							{title}
						</Link>
					) : title ? (
						<p className='line-clamp-2 font-medium leading-snug'>{title}</p>
					) : (
						<span />
					)}
					<div className='flex shrink-0 items-center gap-0.5' aria-label={`${review?.rating ?? 0} of 5`}>
						{Array.from({ length: 5 }).map((_, index) => (
							<Star
								key={index}
								className={
									index < (review?.rating || 0)
										? 'size-3.5 fill-brand text-brand'
										: 'size-3.5 text-border'
								}
								aria-hidden='true'
							/>
						))}
					</div>
				</div>
				{created ? (
					<p className='text-sm text-muted-foreground'>{created}</p>
				) : null}
				<p className='line-clamp-2 text-sm text-muted-foreground'>
					{review?.reviewText}
				</p>
				<div className='mt-auto flex min-w-0 items-center gap-2 pt-3'>
					<PersonAvatar
						name={review?.userName}
						src={review?.userImage}
						className='size-8'
					/>
					<p className='truncate text-sm'>{review?.userName}</p>
				</div>
			</div>
		</article>
	);
}
