import { Star } from 'lucide-react';
import { Link } from 'react-router';
import PersonAvatar from '@/components/Shared/PersonAvatar';
import { StripPhoto } from './ListingStrip';

export default function ReviewCard({ review }) {
	const prop = review?.property || {};
	const created = review?.createdAt
		? new Date(review.createdAt).toLocaleDateString(undefined, {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
			})
		: '';
	const title = prop.title || 'Property';

	return (
		<article className='flex min-h-36 overflow-hidden rounded-lg border border-border bg-surface'>
			{review?.propertyId ? (
				<Link
					to={`/all-properties/${review.propertyId}`}
					className='relative w-2/5 max-w-56 shrink-0 bg-muted'
				>
					<StripPhoto src={prop.image} alt={title} />
				</Link>
			) : (
				<div className='relative w-2/5 max-w-56 shrink-0 bg-muted'>
					<StripPhoto src={prop.image} alt={title} />
				</div>
			)}
			<div className='flex min-w-0 flex-1 flex-col gap-1 p-4'>
				<div className='flex items-start justify-between gap-3'>
					{review?.propertyId ? (
						<Link
							to={`/all-properties/${review.propertyId}`}
							className='line-clamp-2 font-medium leading-snug transition-colors duration-200 hover:text-brand'
						>
							{title}
						</Link>
					) : (
						<p className='line-clamp-2 font-medium leading-snug'>{title}</p>
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
