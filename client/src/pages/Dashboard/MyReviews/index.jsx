import { useState } from 'react';
import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { Star } from 'lucide-react';
import moment from 'moment';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import useAuth from '@/hooks/useAuth';
import { gateQuery } from '@/lib/queryWait';

export default function MyReviews() {
	const { user } = useAuth();
	const axiosSecure = useAxiosSecure();
	const queryClient = useQueryClient();

	const reviewsQuery = useQuery({
		queryKey: ['my-reviews', user?.uid],
		queryFn: async () => {
			const res = await axiosSecure.get(`/reviews/my?uid=${user?.uid}`);
			return res.data;
		},
		enabled: !!user?.uid,
		placeholderData: keepPreviousData,
	});
	const reviews = reviewsQuery.data ?? [];

	const { mutate: deleteReview, isPending: isDeleting } = useMutation({
		mutationFn: async (id) => {
			return await axiosSecure.delete(`/reviews/${id}`);
		},
		onSuccess: () => {
			toast.success('Review deleted');
			queryClient.invalidateQueries(['my-reviews', user?.uid]);
		},
		onError: () => toast.error('Failed to delete review'),
	});

	console.log(user);
	console.log(reviews);

	if (gateQuery(reviewsQuery) === 'loading') return <ReviewSkeleton />;

	if (gateQuery(reviewsQuery) === 'error')
		return <p className='text-destructive'>Could not load your reviews.</p>;

	if (!reviews.length) {
		return (
			<p className='text-base text-muted-foreground'>
				You have not written a review yet.{' '}
				<Link to='/all-properties' className='font-medium text-brand'>
					Browse properties
				</Link>
			</p>
		);
	}

	return (
		<div className='w-full space-y-6'>
			<p className='text-sm text-muted-foreground'>
				{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
			</p>
			<ul className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
				{reviews.map((review) => (
					<MyReviewRow
						key={review._id}
						review={review}
						onDelete={() => deleteReview(review._id)}
						deleting={isDeleting}
					/>
				))}
			</ul>
		</div>
	);
}

function MyReviewRow({ review, onDelete, deleting }) {
	const home = review.property;
	const title = home?.title || review.propertyTitle || 'Open the listing';
	const photo = home?.image || '';
	const when = review.createdAt ? moment(review.createdAt).format('LL') : '';

	return (
		<li className='flex min-h-40 overflow-hidden rounded-lg border border-border bg-surface'>
			{review.propertyId ? (
				<Link
					to={`/all-properties/${review.propertyId}`}
					className='relative w-2/5 max-w-56 shrink-0 bg-muted'
				>
					<FillPhoto src={photo} alt={title} />
				</Link>
			) : (
				<div className='w-2/5 max-w-56 shrink-0 bg-muted' />
			)}
			<div className='flex min-w-0 flex-1 flex-col gap-2 p-4'>
				{review.propertyId ? (
					<Link
						to={`/all-properties/${review.propertyId}`}
						className='truncate font-medium transition-colors duration-200 hover:text-brand'
					>
						{title}
					</Link>
				) : (
					<p className='truncate font-medium'>{title}</p>
				)}
				{home?.location ? (
					<p className='truncate text-sm text-muted-foreground'>{home.location}</p>
				) : null}
				<p className='text-base'>{review.reviewText}</p>
				<div className='mt-auto flex items-end justify-between gap-3 pt-2'>
					<div className='min-w-0'>
						<ReviewStars rating={review.rating} />
						{review.agentName ? (
							<p className='truncate text-sm text-muted-foreground'>
								{review.agentName}
							</p>
						) : null}
						{when ? (
							<p className='text-sm text-muted-foreground'>{when}</p>
						) : null}
					</div>
					<div className='flex shrink-0 gap-2'>
						{review.propertyId ? (
							<Button size='sm' variant='outline' asChild>
								<Link to={`/all-properties/${review.propertyId}`}>View</Link>
							</Button>
						) : null}
						<Button
							variant='ghost'
							size='sm'
							className='text-destructive'
							onClick={onDelete}
							disabled={deleting}
						>
							Delete
						</Button>
					</div>
				</div>
			</div>
		</li>
	);
}

function FillPhoto({ src, alt }) {
	const [failed, setFailed] = useState(false);
	if (!src || failed) return null;
	return (
		<img
			src={src}
			alt={alt || ''}
			className='absolute inset-0 h-full w-full object-cover'
			onError={() => setFailed(true)}
		/>
	);
}

function ReviewStars({ rating }) {
	const value = Number(rating);
	const known = Number.isInteger(value) && value >= 1 && value <= 5;
	if (!known) return null;
	return (
		<p className='flex items-center gap-1'>
			<span className='sr-only'>{value} out of 5</span>
			{Array.from({ length: 5 }, (_, index) => (
				<Star
					key={index}
					aria-hidden='true'
					className={`size-4 ${
						index < value ? 'fill-warning text-warning' : 'text-line'
					}`}
				/>
			))}
		</p>
	);
}

function ReviewSkeleton() {
	return (
		<div className='grid grid-cols-1 gap-4 xl:grid-cols-2' aria-busy='true'>
			<span className='sr-only'>Loading reviews</span>
			{Array.from({ length: 4 }, (_, index) => (
				<div
					key={index}
					className='flex min-h-40 overflow-hidden rounded-lg border border-border bg-surface'
				>
					<Skeleton className='w-2/5 max-w-56 rounded-none' />
					<div className='flex-1 space-y-2 p-4'>
						<Skeleton className='h-4 w-2/3' />
						<Skeleton className='h-3 w-full' />
						<Skeleton className='h-3 w-1/2' />
					</div>
				</div>
			))}
		</div>
	);
}
