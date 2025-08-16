import React from 'react';
import { FaStar } from 'react-icons/fa';
import { Link } from 'react-router';

export default function ReviewCard({ review }) {
	const prop = review?.property || {};
	const userImage = review?.userImage || '/default-avatar.png';
	const avatar = userImage;
	const propertyImage = prop.image || '/placeholder.jpg';
	const created = review?.createdAt
		? new Date(review.createdAt).toLocaleDateString()
		: '';

	return (
		<div className='bg-card rounded-xl p-4 shadow-md flex flex-col h-full border border-border/50'>
			{/* top: property thumbnail + property title */}
			<div className='flex items-center gap-3 mb-3'>
				<img
					src={propertyImage}
					alt={prop.title || 'property'}
					className='w-16 h-12 rounded-md object-cover flex-shrink-0 bg-accent'
				/>
				<div className='flex-1'>
					<Link
						to={
							review?.propertyId ? `/all-properties/${review.propertyId}` : '#'
						}
						className='font-semibold text-sm text-foreground hover:text-primary'
					>
						{prop.title || 'Property'}
					</Link>
					<div className='text-xs text-muted-foreground'>{created}</div>
				</div>
			</div>

			{/* review text */}
			<p className='text-sm text-muted-foreground line-clamp-3 mb-3'>
				{review.reviewText}
			</p>

			<div className='mt-auto flex items-center justify-between'>
				<div className='flex items-center gap-3'>
					<img
						src={avatar}
						alt={review.userName}
						className='w-9 h-9 rounded-full object-cover bg-accent'
					/>
					<div>
						<div className='text-sm font-medium'>{review.userName}</div>
						<div className='text-xs text-muted-foreground'>
							Rating: {review.rating ?? '-'}
						</div>
					</div>
				</div>

				<div className='flex items-center gap-1'>
					{/* stars */}
					{Array.from({ length: 5 }).map((_, i) => (
						<FaStar
							key={i}
							className={`w-3 h-3 ${
								i < (review.rating || 0) ? 'text-yellow-400' : 'text-border/40'
							}`}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
