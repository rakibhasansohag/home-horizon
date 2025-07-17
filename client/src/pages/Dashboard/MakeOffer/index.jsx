import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
import useAuth from '@/hooks/useAuth';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import { useParams, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';

export default function MakeOffer() {
	const { propertyId } = useParams();
	const { user } = useAuth();
	const axiosSecure = useAxiosSecure();
	const navigate = useNavigate();

	const {
		data: property,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['property-details', propertyId],
		queryFn: async () => {
			const res = await axiosSecure.get(`/properties/${propertyId}`);
			return res.data;
		},
		enabled: !!propertyId,
	});

	const { data: userOffer, isLoading: isOfferLoading } = useQuery({
		queryKey: ['offer-by-user', user?.email, propertyId],
		queryFn: async () => {
			const res = await axiosSecure.get(
				`/offers/user?email=${user?.email}&propertyId=${propertyId}`,
			);
			return res.data; // should return the single offer object or null
		},
		enabled: !!user?.email && !!propertyId,
	});

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();

	const { mutate: submitOffer, isLoading: isSubmitting } = useMutation({
		mutationFn: async (data) => {
			const res = await axiosSecure.post('/offers', data);
			return res.data;
		},
		onSuccess: () => {
			toast.success('Offer submitted successfully!');
			navigate('/dashboard/property-bought');
		},
		onError: (err) => {
			toast.error(err?.response?.data?.error || 'Failed to submit offer');
		},
	});

	useEffect(() => {
		document.title = 'Make Offer | HomeHorizon';
	}, []);

	const onSubmit = (data) => {
		const price = parseInt(data.amount);
		if (price < property.minPrice || price > property.maxPrice) {
			toast.error(
				`Amount must be between ৳${property.minPrice} - ৳${property.maxPrice}`,
			);
			return;
		}

		const payload = {
			...data,
			propertyId,
			propertyTitle: property.title,
			location: property.location,
			agentName: property.agentName,
			agentId: property.agentId,
			buyerId: user?.uid,
			buyerEmail: user?.email,
			buyerName: user?.displayName,
			status: 'pending',
			createdAt: new Date().toISOString(),
			propertyLocation: property.location,
			propertyImage: property.images[0]?.url,
			updatedAt: new Date().toISOString(),
			minPrice: property.minPrice,
			maxPrice: property.maxPrice,
		};

		submitOffer(payload);
	};

	const isSoldGlobally = property?.dealStatus === 'sold';
	const userAlreadyBought = userOffer?.status === 'bought';

	useEffect(() => {
		if (
			(isSoldGlobally || userAlreadyBought) &&
			!isLoading &&
			!isOfferLoading
		) {
			const timeout = setTimeout(() => {
				navigate(window.history.length > 2 ? -1 : '/');
			}, 4000);
			return () => clearTimeout(timeout);
		}
	}, [isSoldGlobally, userAlreadyBought, isLoading, isOfferLoading, navigate]);

	if (isLoading) {
		return <Skeleton className='w-full h-96' />;
	}

	if ((isSoldGlobally || userAlreadyBought) && !isLoading && !isOfferLoading) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 40 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className='w-full flex flex-col items-center justify-center text-center p-6'
			>
				<img
					src='https://cdn-icons-png.flaticon.com/512/4076/4076549.png'
					alt='sold'
					className='w-24 h-24 mb-4 animate-pulse'
				/>
				<h2 className='text-2xl font-semibold text-red-600 mb-2'>
					{isSoldGlobally
						? 'This property has already been sold'
						: 'You have already bought this property'}
				</h2>
				<p className='text-muted-foreground text-base'>
					Redirecting you back in a few seconds...
				</p>
			</motion.div>
		);
	}

	if (isError || !property) {
		return <p className='text-destructive'>Failed to load property details</p>;
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 50 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className='max-w-7xl p-4 w-full'
		>
			<Card className='p-6 space-y-4'>
				<h2 className='text-xl font-semibold'>
					Make an Offer for "{property.title}"
				</h2>
				<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div>
							<Label>Property Title</Label>
							<Input value={property.title} readOnly />
						</div>
						<div>
							<Label>Location</Label>
							<Input value={property.location} readOnly />
						</div>
						<div>
							<Label>Agent Name</Label>
							<Input value={property.agentName} readOnly />
						</div>
						<div>
							<Label>Price Range</Label>
							<Input
								value={`৳${property.minPrice} - ৳${property.maxPrice}`}
								readOnly
							/>
						</div>
						<div>
							<Label>Your Name</Label>
							<Input value={user?.displayName} readOnly />
						</div>
						<div>
							<Label>Your Email</Label>
							<Input value={user?.email} readOnly />
						</div>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div>
							<Label>Offer Amount (৳)</Label>
							<Input
								type='number'
								placeholder='Enter amount within price range'
								{...register('offerAmount', { required: true })}
							/>
							{errors.amount && (
								<p className='text-sm text-red-500 mt-1'>
									Offer amount is required
								</p>
							)}
						</div>

						<div>
							<Label>Buying Date</Label>
							<Input
								type='date'
								{...register('buyingDate', { required: true })}
							/>
							{errors.buyingDate && (
								<p className='text-sm text-red-500 mt-1'>
									Buying date is required
								</p>
							)}
						</div>
					</div>

					<Button type='submit' className='w-full' disabled={isSubmitting}>
						{isSubmitting ? 'Submitting...' : 'Submit Offer'}
					</Button>
				</form>
			</Card>
		</motion.div>
	);
}
