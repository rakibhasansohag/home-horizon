import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import useAuth from '@/hooks/useAuth';
import moment from 'moment';
import { toast } from 'react-toastify';
import SkeletonCard from '@/components/Shared/skeletons/SkeletonCard';
import { useNavigate } from 'react-router';

export default function MyReviews() {
	const { user } = useAuth();
	const axiosSecure = useAxiosSecure();
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const {
		data: reviews = [],
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['my-reviews', user?.uid],
		queryFn: async () => {
			const res = await axiosSecure.get(`/reviews/my?uid=${user?.uid}`);
			return res.data;
		},
		enabled: !!user?.uid,
	});

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

	if (isLoading) {
		return (
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl'>
				{Array.from({ length: 6 }).map((_, i) => (
					<SkeletonCard key={i} />
				))}
			</div>
		);
	}

	if (isError)
		return <p className='text-destructive'>Failed to load reviews</p>;

	return (
		<div className='p-6 space-y-4 max-w-7xl w-full'>
			<h2 className='text-2xl font-bold'>My Reviews ({reviews?.length}) </h2>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
				{reviews?.map((review) => (
					<Card key={review._id}>
						<CardHeader>
							<CardTitle className='text-lg'>
								Property:{' '}
								<span className='font-medium text-primary'>
									{review.propertyTitle || 'N/A'}
								</span>
							</CardTitle>
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
								<p className='text-sm text-yellow-600'>
									⭐ Rating: {review.rating}/5
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
