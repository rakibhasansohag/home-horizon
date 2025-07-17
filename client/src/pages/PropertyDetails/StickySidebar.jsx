import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useAuth from '@/hooks/useAuth';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';

export default function StickySidebar({ propertyId, dealStatus }) {
	const axiosSecure = useAxiosSecure();
	const { user } = useAuth();
	const navigate = useNavigate();

	const queryClient = useQueryClient();

	// Point:  Check if property is already in wishlist
	const { data: wishlist = [], isLoading: loadingWishlist } = useQuery({
		queryKey: ['user-wishlist', user?.uid],
		queryFn: async () => {
			const res = await axiosSecure.get(`/wishlist?userId=${user?.uid}`);
			return res.data;
		},
		enabled: !!user?.uid,
	});

	const alreadyWishlisted = wishlist.some(
		(item) => item.propertyId === propertyId,
	);

	// Point:  Mutation to add to wishlist
	const { mutate: handleAddToWishlist, isLoading: adding } = useMutation({
		mutationFn: async () => {
			const res = await axiosSecure.post('/wishlist', {
				propertyId,
				userId: user?.uid,
				userEmail: user?.email,
			});
			return res.data;
		},
		onSuccess: () => {
			toast.success('Added to wishlist');
			console.log('Added to wishlist!');
			queryClient.invalidateQueries(['user-wishlist', user?.uid]);
		},

		onError: (err) => {
			toast.error(err?.response?.data?.error);
			console.error('Failed to add to wishlist:', err);
		},
	});

	const handleClick = () => {
		if (alreadyWishlisted) {
			navigate('/dashboard/wishlist');
		} else {
			handleAddToWishlist();
		}
	};

	// TODO : we will check if the proprety status is paid/sold/accipted we will make this property add to wihs list or make an offer it will be disbled or do somehting that user can not make any changes  if it's for sale and also we will make the staus as sold if the user paid the price

	return (
		<div className='lg:sticky lg:top-20'>
			<Card className='p-4 !space-y-2 gap-2'>
				<Button
					onClick={handleClick}
					className='w-full'
					size='lg'
					disabled={adding || loadingWishlist}
				>
					{loadingWishlist
						? 'Checking...'
						: alreadyWishlisted
						? 'View in Wishlist'
						: adding
						? 'Adding...'
						: 'Add to Wishlist'}
				</Button>

				<p className='text-sm text-muted-foreground'>
					After adding to Wishlist, you can view all your desired properties in
					your profile page
				</p>

				<Button
					className={`
		w-full text-base font-semibold py-2 px-4 rounded-lg transition-all duration-300
		border
		${
			dealStatus === 'sold' || dealStatus === 'accepted'
				? 'bg-muted text-muted-foreground cursor-not-allowed border-muted hover:shadow-none'
				: 'bg-white text-primary border-primary hover:bg-primary hover:text-white hover:shadow-md'
		}
		disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale
	`}
					variant='ghost'
					size='lg'
					type='button'
					onClick={() => navigate(`/dashboard/offer/${propertyId}`)}
					disabled={dealStatus === 'sold' || dealStatus === 'accepted'}
				>
					{dealStatus === 'sold'
						? 'Sold'
						: dealStatus === 'accepted'
						? 'Accepted'
						: 'Make an Offer'}
				</Button>

				<p className='text-sm text-muted-foreground'>
					Make a winning offer with the help of a local agent
				</p>

				<Separator />
			</Card>
		</div>
	);
}
