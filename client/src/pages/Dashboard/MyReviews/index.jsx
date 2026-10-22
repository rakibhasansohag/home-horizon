import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import useAuth from '@/hooks/useAuth';
import moment from 'moment';
import { toast } from 'react-toastify';
import SkeletonCard from '@/components/Shared/skeletons/SkeletonCard';
import { gateQuery } from '@/lib/queryWait';
import { Link, useNavigate } from 'react-router';
import { Star } from 'lucide-react';

export default function MyReviews() {
	const { user } = useAuth();
	const axiosSecure = useAxiosSecure();
	const queryClient = useQueryClient();
	const navigate = useNavigate();

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

	if (gateQuery(reviewsQuery) === 'loading') {
		return (
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl'>
				{Array.from({ length: 6 }).map((_, i) => (
					<SkeletonCard key={i} />
				))}
			</div>
		);
	}

	if (gateQuery(reviewsQuery) === 'error')
		return <p className='text-destructive'>Could not load your reviews.</p>;

	if (!reviews.length) {
		return (
			<p className='text-base text-muted-foreground'>
				You have not written a review yet.{' '}
				<Link to='/all-properties' className='font-medium text-brand hover:underline'>
					Browse properties
				</Link>
			</p>
		);
	}

	return (
		<div className='w-full max-w-7xl space-y-4'>
			<p className='text-base text-muted-foreground'>
				{reviews.length} reviews
			</p>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
				{reviews?.map((review) => (
					<Card key={review._id}>
						<CardHeader>
							<CardTitle className='text-lg'>
								<Link
									to={`/all-properties/${review.propertyId}`}
									className='font-medium text-brand'
								>
									{review.property?.title || review.propertyTitle || 'Listing'}
								</Link>
							</CardTitle>
							{review.property?.image ? (
								<img
									src={review.property.image}
									alt=''
									className='mt-2 h-28 w-full rounded-md object-cover'
								/>
							) : null}
							<p className='text-sm text-muted-foreground'>
								Agent: {review.agentName || 'Unknown'}
							</p>
							<p className='text-sm text-muted-foreground'>
								Reviewed on:{' '}
								{moment(review.createdAt).format('DD-MM-YYYY HH:mm:ss')}
							</p>
						</CardHeader>
						<CardContent className='space-y-3'>
							<p className='text-base'>{review.reviewText}</p>

							<div className='flex items-center justify-between'>
								<p className='flex items-center gap-1 text-sm text-foreground'>
									<Star className='size-4 fill-brand text-brand' aria-hidden='true' />
									{review.rating}/5
								</p>
								<div className='flex gap-2'>
									<Button
										size={'sm'}
										onClick={() =>
											navigate(`/all-properties/${review.propertyId}`)
										}
									>
										View
									</Button>
									<Button
										variant='destructive'
										size='sm'
										onClick={() => deleteReview(review._id)}
										disabled={isDeleting}
									>
										Delete
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
