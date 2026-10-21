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
	ResultSummary,
	ShowMore,
} from '@/pages/Dashboard/Components/DashboardFilter';
import PropertyPreview from './PropertyPreview';

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
				`${review.userName || ''} ${review.reviewText || ''}`
					.toLowerCase()
					.includes(term),
			)
		: reviews;
	const rows = filtered.slice(0, visible);

	return (
		<div className='w-full max-w-7xl space-y-6'>
			<section className='rounded-lg border border-border bg-surface p-4'>
				<h2 className='mb-3 text-base font-semibold'>Find a review</h2>
				<Input
					value={query}
					placeholder='Name or review'
					onChange={(event) => {
						setQuery(event.target.value);
						setVisible(PREVIEW_LIMIT);
					}}
				/>
			</section>
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
					<ResultSummary
						label={term ? 'Matching reviews' : 'All reviews'}
						value={filtered.length}
					/>
					{rows.length === 0 ? (
						<p className='text-base text-muted-foreground'>No reviews match.</p>
					) : (
						<div className='space-y-6'>
							<ul className='overflow-hidden rounded-lg border border-border bg-surface'>
								{rows.map((review) => (
									<li
										key={review._id}
										className='flex flex-col gap-3 border-b border-border p-4 last:border-b-0 sm:flex-row sm:items-start sm:justify-between'
									>
										<div className='flex min-w-0 gap-3'>
											<PersonAvatar
												name={review.userName}
												src={review.userImage}
											/>
											<div className='min-w-0 space-y-1'>
												<div className='flex flex-wrap items-baseline gap-x-3 gap-y-1'>
													<p className='font-medium'>
														{review.userName || 'Anonymous'}
													</p>
													{reviewDate(review.createdAt) ? (
														<p className='text-sm text-muted-foreground'>
															{reviewDate(review.createdAt)}
														</p>
													) : null}
												</div>
												{review.userEmail ? (
													<p className='truncate text-sm text-muted-foreground'>
														{review.userEmail}
													</p>
												) : null}
												<ReviewStars rating={review.rating} />
												<p className='max-w-2xl text-base'>{review.reviewText}</p>
												{review.propertyId ? (
													<Link
														to={`/all-properties/${review.propertyId}`}
														className='inline-block text-sm text-brand'
													>
														{review.propertyTitle || 'Open the listing'}
													</Link>
												) : null}
											</div>
										</div>
										<Button
											variant='ghost'
											size='sm'
											className='self-start text-destructive'
											onClick={() => setSelectedReview(review)}
										>
											Delete
										</Button>
									</li>
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
						{selectedReview?.propertyId && (
							<PropertyPreview propertyId={selectedReview.propertyId} />
						)}
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
		<div
			className='overflow-hidden rounded-lg border border-border bg-surface'
			aria-busy='true'
		>
			<span className='sr-only'>Loading reviews</span>
			{Array.from({ length: 6 }, (_, index) => (
				<div
					key={index}
					className='flex items-center gap-3 border-b border-border p-4 last:border-b-0'
				>
					<Skeleton className='size-12 rounded-full' />
					<div className='space-y-2'>
						<Skeleton className='h-4 w-40' />
						<Skeleton className='h-3 w-64' />
					</div>
				</div>
			))}
		</div>
	);
}
