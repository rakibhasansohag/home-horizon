import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import { gateQuery } from '@/lib/queryWait';
import useAuth from '@/hooks/useAuth';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import { useParams, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { formatMoney } from '@/components/Shared/PropertyCard';
import { homeFacts, listedAmenities } from '@/lib/amenities';

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

	const { mutate: submitOffer, isPending: isSubmitting } = useMutation({
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
		const price = Number(data.offerAmount);
		const low = Number(property.minPrice);
		const high = Number(property.maxPrice);
		if (!Number.isFinite(price) || price < low || price > high) {
			toast.error(`Amount must be between ${formatMoney(low)} and ${formatMoney(high)}`);
			return;
		}

		const payload = {
			...data,
			offerAmount: price,
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

	if (gateQuery({ data: property, isError, isFetching: isLoading }) === 'loading' || isLoading || isOfferLoading) {
		return <Skeleton className='h-96 w-full' />;
	}

	if ((isSoldGlobally || userAlreadyBought) && !isLoading && !isOfferLoading) {
		return (
			<div className='flex w-full flex-col items-center justify-center p-6 text-center'>
				<h2 className='mb-2 text-2xl font-semibold text-danger'>
					{isSoldGlobally
						? 'This property has already been sold'
						: 'You have already bought this property'}
				</h2>
				<p className='text-base text-muted-foreground'>
					Redirecting you back in a few seconds...
				</p>
			</div>
		);
	}

	if ((isError || !property) && !isLoading && !isOfferLoading) {
		return <p className='text-destructive'>Could not load this property.</p>;
	}

	const facts = homeFacts(property);
	const offered = listedAmenities(property.amenities).slice(0, 4);
	const photo = property.images?.[0]?.url || '';

	return (
		<div className='w-full max-w-3xl space-y-6'>
			<article className='flex min-h-44 overflow-hidden rounded-lg border border-border bg-surface'>
				<div className='relative w-2/5 max-w-72 shrink-0 bg-muted'>
					<FillPhoto src={photo} alt={property.title} />
				</div>
				<div className='flex min-w-0 flex-1 flex-col gap-1 p-4'>
					<h2 className='line-clamp-2 text-lg font-medium leading-snug'>
						{property.title}
					</h2>
					{property.location ? (
						<p className='truncate text-sm text-muted-foreground'>
							{property.location}
						</p>
					) : null}
					{facts ? (
						<p className='text-sm text-muted-foreground'>{facts}</p>
					) : null}
					<p className='text-base font-medium tabular-nums'>
						{formatMoney(property.minPrice)} – {formatMoney(property.maxPrice)}
					</p>
					{property.agentName ? (
						<p className='text-sm text-muted-foreground'>{property.agentName}</p>
					) : null}
					{offered.length ? (
						<p className='text-sm text-muted-foreground'>
							{offered.map((item) => item.label).join(' · ')}
						</p>
					) : null}
				</div>
			</article>

			<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
				<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
					<div className='space-y-2'>
						<Label htmlFor='offer-amount'>Offer amount</Label>
						<Input
							id='offer-amount'
							type='number'
							placeholder='Enter an amount inside the price range'
							{...register('offerAmount', {
								required: 'Offer amount is required',
							})}
						/>
						{errors.offerAmount ? (
							<p className='text-sm text-destructive'>
								{errors.offerAmount.message}
							</p>
						) : (
							<p className='text-sm text-muted-foreground'>
								Between {formatMoney(property.minPrice)} and{' '}
								{formatMoney(property.maxPrice)}
							</p>
						)}
					</div>
					<div className='space-y-2'>
						<Label htmlFor='buying-date'>Buying date</Label>
						<Input
							id='buying-date'
							type='date'
							{...register('buyingDate', { required: 'Buying date is required' })}
						/>
						{errors.buyingDate ? (
							<p className='text-sm text-destructive'>
								{errors.buyingDate.message}
							</p>
						) : null}
					</div>
					<div className='space-y-2'>
						<Label>Your name</Label>
						<Input value={user?.displayName || ''} readOnly className='bg-muted' />
					</div>
					<div className='space-y-2'>
						<Label>Your email</Label>
						<Input value={user?.email || ''} readOnly className='bg-muted' />
					</div>
				</div>
				<Button type='submit' disabled={isSubmitting}>
					{isSubmitting ? 'Submitting...' : 'Submit offer'}
				</Button>
			</form>
		</div>
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
