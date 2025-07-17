import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import useAuth from '@/hooks/useAuth';
import { toast } from 'react-toastify';
import PropertyCard from '@/components/Shared/PropertyCard';
import { Button } from '@/components/ui/button';
import SkeletonCard from '@/components/Shared/skeletons/SkeletonCard';

export default function MyWishlist() {
	const axiosSecure = useAxiosSecure();
	const { user } = useAuth();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { data: wishlist = [], isLoading } = useQuery({
		queryKey: ['user-wishlist', user?.uid],
		queryFn: async () => {
			const res = await axiosSecure.get(`/wishlist?userId=${user?.uid}`);
			const propertyIds = res.data.map((item) => item.propertyId);

			// Fetch properties based on IDs
			const propsRes = await axiosSecure.post('/wishlist/properties', {
				propertyIds,
			});
			return propsRes.data;
		},
		enabled: !!user?.uid,
	});

	const { mutate: removeFromWishlist, isLoading: removing } = useMutation({
		mutationFn: async (propertyId) => {
			await axiosSecure.delete(
				`/wishlist?userId=${user?.uid}&propertyId=${propertyId}`,
			);
		},
		onSuccess: () => {
			toast.success('Removed from wishlist');
			queryClient.invalidateQueries(['user-wishlist', user?.uid]);
		},
		onError: () => {
			toast.error('Failed to remove');
		},
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

	if (wishlist.length === 0) {
		return (
			<p className='text-center text-muted-foreground mt-10'>
				Your wishlist is empty 🥲
			</p>
		);
	}

	return (
		<div className='p-6 space-y-4 w-full max-w-7xl'>
			<h2 className='text-2xl font-bold'>Wish List</h2>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-center justify-center  '>
				{wishlist.map((property) => (
					<PropertyCard key={property._id} property={property}>
						<div className='flex gap-2 mt-4'>
							<Button
								onClick={() => navigate(`/dashboard/offer/${property._id}`)}
								size='sm'
								className=''
							>
								Make Offer
							</Button>
							<Button
								variant='destructive'
								onClick={() => removeFromWishlist(property._id)}
								disabled={removing}
								size='sm'
								className=''
							>
								Remove
							</Button>
						</div>
					</PropertyCard>
				))}
			</div>
		</div>
	);
}
