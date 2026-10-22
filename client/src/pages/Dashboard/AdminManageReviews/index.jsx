import { useState } from 'react';
import { Link } from 'react-router';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import PersonAvatar from '@/components/Shared/PersonAvatar';
import ConfirmActionModal from '@/components/shared/ConfirmActionModal';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import { gateQuery } from '@/lib/queryWait';
import {
	PREVIEW_LIMIT,
	ShowMore,
} from '@/pages/Dashboard/Components/DashboardFilter';

export default function AdminManageReviews() {
	const axiosSecure = useAxiosSecure();
	const queryClient = useQueryClient();

	const [selectedReview, setSelectedReview] = useState(null);
	const [query, setQuery] = useState('');
	const [visible, setVisible] = useState(PREVIEW_LIMIT);

	const reviewsQuery = useQuery({
		queryKey: ['admin-reviews'],
		queryFn: async () => {
			const res = await axiosSecure.get('/admin/reviews');
			return res.data;
		},
		placeholderData: keepPreviousData,
	});
	const { data: reviews = [] } = reviewsQuery;
	const gate = gateQuery(reviewsQuery);

	const deleteMutation = useMutation({
		mutationFn: async (id) => {
			await axiosSecure.delete(`/reviews/${id}`);
		},
		onSuccess: () => {
			toast.success('Review deleted');
			queryClient.invalidateQueries(['admin-reviews']);
			setSelectedReview(null);
		},
		onError: () => toast.error('Failed to delete review'),
	});

	const term = query.trim().toLowerCase();
	const filtered = term
		? reviews.filter((review) =>
				`${review.userName || ''} ${review.reviewText || ''} ${review.property?.title || review.propertyTitle || ''}`
					.toLowerCase()
					.includes(term),
			)
		: reviews;
	const rows = filtered.slice(0, visible);

	return (
		<div className='w-full space-y-6'>
			<Input
				value={query}
				aria-label='Find a review'
				placeholder='Search by name, home, or review'
				onChange={(event) => {
					setQuery(event.target.value);
					setVisible(PREVIEW_LIMIT);
				}}
			/>
			{gate === 'error' ? (
				<div className='space-y-3'>
					<p className='text-destructive'>Could not load reviews.</p>
					<Button
						type='button'
						variant='outline'
						onClick={() => reviewsQuery.refetch()}
					>
						Try again
					</Button>
				</div>
			) : gate === 'loading' ? (
				<ReviewSkeleton />
			) : (
				<>
					<p className='text-sm text-muted-foreground'>
						{filtered.length} {filtered.length === 1 ? 'review' : 'reviews'}
					</p>
					{rows.length === 0 ? (
						<p className='text-base text-muted-foreground'>No reviews match.</p>
					) : (
						<div className='space-y-6'>
							<ul className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
								{rows.map((review) => (
									<ReviewRow
										key={review._id}
										review={review}
										onDelete={() => setSelectedReview(review)}
									/>
								))}
							</ul>
							<ShowMore
								shown={rows.length}
								total={filtered.length}
								onMore={() => setVisible((count) => count + PREVIEW_LIMIT)}
							/>
						</div>
					)}
				</>
			)}

			<ConfirmActionModal
				isOpen={!!selectedReview}
				onClose={() => setSelectedReview(null)}
				title='Delete this review?'
				description={
					<>
						<p>
							Delete the review from {selectedReview?.userName || 'this person'}?
						</p>
						{selectedReview?.property ? (
							<Link
								to={`/all-properties/${selectedReview.property._id}`}
								className='flex items-center gap-3 rounded-lg border border-border p-2'
							>
								{selectedReview.property.image ? (
									<img
										src={selectedReview.property.image}
										alt=''
										className='size-12 rounded-md object-cover'
									/>
								) : (
									<div className='size-12 rounded-md bg-muted' />
								)}
								<span className='min-w-0'>
									<span className='block truncate text-sm font-medium'>
										{selectedReview.property.title}
									</span>
									<span className='block truncate text-sm text-muted-foreground'>
										{selectedReview.property.location}
									</span>
								</span>
							</Link>
						) : null}
					</>
				}
				actionLabel='Delete'
				variant='destructive'
				loading={deleteMutation.isPending}
				onConfirm={() => deleteMutation.mutate(selectedReview._id)}
			/>
		</div>
	);
}

function ReviewRow({ review, onDelete }) {
	const home = review.property;
	const title = home?.title || review.propertyTitle || 'Open the listing';
	const photo = home?.image || '';
	const date = reviewDate(review.createdAt);

	return (
		<li className='flex min-h-40 overflow-hidden rounded-lg border border-border bg-surface'>
			{review.propertyId ? (
				<Link
					to={`/all-properties/${review.propertyId}`}
					className='relative w-2/5 max-w-56 shrink-0 bg-muted'
				>
					<FillPhoto src={photo} />
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
				) : null}
				<p className='text-base'>{review.reviewText}</p>
				<div className='mt-auto flex items-end justify-between gap-3 pt-2'>
					<div className='flex min-w-0 items-center gap-2'>
						<PersonAvatar
							name={review.userName}
							src={review.userImage}
							className='size-8'
						/>
						<div className='min-w-0'>
							<p className='truncate text-sm'>
								{review.userName || 'Anonymous'}
							</p>
							<ReviewStars rating={review.rating} />
							{date ? (
								<p className='text-sm text-muted-foreground'>{date}</p>
							) : null}
						</div>
					</div>
					<Button
						variant='ghost'
						size='sm'
						className='shrink-0 text-destructive'
						onClick={onDelete}
					>
						Delete
					</Button>
				</div>
			</div>
		</li>
	);
}

function FillPhoto({ src }) {
	const [failed, setFailed] = useState(false);
	if (!src || failed) return null;
	return (
		<img
			src={src}
			alt=''
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

function reviewDate(value) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '';
	return date.toLocaleDateString('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	});
}

function ReviewSkeleton() {
	return (
		<div className='grid grid-cols-1 gap-4 xl:grid-cols-2' aria-busy='true'>
			<span className='sr-only'>Loading reviews</span>
			{Array.from({ length: 6 }, (_, index) => (
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
