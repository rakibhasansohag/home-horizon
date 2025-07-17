import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ConfirmActionModal from '@/components/shared/ConfirmActionModal';
import { toast } from 'react-toastify';
import SkeletonCard from '../../../components/Shared/skeletons/SkeletonCard';
import PropertyPreview from './PropertyPreview';

export default function AdminManageReviews() {
	const axiosSecure = useAxiosSecure();
	const queryClient = useQueryClient();

	const [selectedReview, setSelectedReview] = useState(null);

	const {
		data: reviews = [],
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['admin-reviews'],
		queryFn: async () => {
			const res = await axiosSecure.get('/admin/reviews');
			return res.data;
		},
	});

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
		<div className='p-6 w-full space-y-4 max-w-7xl'>
			<h2 className='text-2xl font-semibold'>Manage Reviews</h2>
			<div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
				{reviews.map((review) => (
					<Card
						key={review._id}
						className='border bg-background transition hover:shadow-md'
					>
						<CardContent className='p-4 space-y-2'>
							<div className='flex items-center gap-3'>
								<Avatar>
									<AvatarImage src={review.userImage} />
									<AvatarFallback>{review.userName?.[0] || '?'}</AvatarFallback>
								</Avatar>
								<div>
									<p className='font-medium'>{review.userName}</p>
									<p className='text-sm text-muted-foreground'>
										{review.userEmail}
									</p>
								</div>
							</div>
							<p className='text-sm text-foreground italic my-4'>
								“{review.reviewText}”
							</p>
							<Button
								variant='destructive'
								size='sm'
								onClick={() => setSelectedReview(review)}
							>
								Delete
							</Button>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Confirmation Modal */}
			<ConfirmActionModal
				isOpen={!!selectedReview}
				onClose={() => setSelectedReview(null)}
				title='Delete this review?'
				// description={`Are you sure you want to delete the review from ${selectedReview?.userName}?`}
				description={
					<>
						<p>
							Are you sure you want to delete the review from{' '}
							<strong>{selectedReview?.userName}</strong>?
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
