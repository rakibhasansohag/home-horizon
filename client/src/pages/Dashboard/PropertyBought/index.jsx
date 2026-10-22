import { useState } from 'react';
import { keepPreviousData, useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'react-router';
import useAuth from '@/hooks/useAuth';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import PersonAvatar from '@/components/Shared/PersonAvatar';
import { formatMoney } from '@/components/Shared/PropertyCard';
import { gateQuery } from '@/lib/queryWait';
import { cn } from '@/lib/utils';
import { toast } from 'react-toastify';
import ConfirmPaymentModal from '../../../components/Shared/ConfirmPaymentModal';

const STATUS_TONE = {
	pending: 'text-warning',
	accepted: 'text-brand',
	bought: 'text-success',
	rejected: 'text-destructive',
};

export default function PropertyBought() {
	const { user } = useAuth();
	const [currentPayingId, setCurrentPayingId] = useState(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedOffer, setSelectedOffer] = useState(null);

	const axiosSecure = useAxiosSecure();

	const offersQuery = useQuery({
		queryKey: ['offers', user?.email],
		queryFn: async () => {
			const res = await axiosSecure.get(`/offers?email=${user?.email}`);
			return res.data;
		},
		enabled: !!user?.email,
		placeholderData: keepPreviousData,
	});
	const offers = offersQuery.data;

	const { mutate: initiatePayment, isPending: isPaying } = useMutation({
		mutationFn: async (offerId) => {
			setCurrentPayingId(offerId);
			const res = await axiosSecure.post('/payments/create-checkout-session', {
				offerId,
			});
			return res.data;
		},
		onSuccess: (data) => {
			window.location.href = data.url; // redirect to Stripe
		},
		onError: () => {
			toast.error('Could not initiate payment');
			setCurrentPayingId(null);
		},
	});

	if (gateQuery(offersQuery) === 'loading') return <OfferSkeleton />;

	if (gateQuery(offersQuery) === 'error') {
		return <p className='text-destructive'>Could not load your offers.</p>;
	}

	if (!offers?.length) {
		return (
			<p className='text-base text-muted-foreground'>
				You have not made an offer yet.{' '}
				<Link to='/all-properties' className='font-medium text-brand'>
					Browse properties
				</Link>
			</p>
		);
	}

	return (
		<div className='w-full space-y-6'>
			<p className='text-sm text-muted-foreground'>
				{offers.length} {offers.length === 1 ? 'offer' : 'offers'}
			</p>
			<ul className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
				{offers.map((offer) => (
					<OfferRow
						key={offer._id}
						offer={offer}
						paying={isPaying && currentPayingId === offer._id}
						onPay={() => {
							setSelectedOffer(offer);
							setModalOpen(true);
						}}
					/>
				))}
			</ul>
			<ConfirmPaymentModal
				open={modalOpen}
				onCancel={() => {
					setModalOpen(false);
					setSelectedOffer(null);
				}}
				onConfirm={() => {
					if (selectedOffer?._id) {
						initiatePayment(selectedOffer._id);
						setModalOpen(false);
					}
				}}
				propertyTitle={selectedOffer?.propertyTitle}
				offerAmount={selectedOffer?.offerAmount}
			/>
		</div>
	);
}

function OfferRow({ offer, paying, onPay }) {
	const photo = offer.property?.image || offer.propertyImage || '';
	const title = offer.property?.title || offer.propertyTitle || 'Listing';
	const location = offer.property?.location || offer.propertyLocation || '';
	const agent = offer.property?.agentName || offer.agentName || '';

	return (
		<li className='flex min-h-44 overflow-hidden rounded-lg border border-border bg-surface'>
			{offer.propertyId ? (
				<Link
					to={`/all-properties/${offer.propertyId}`}
					className='relative w-2/5 max-w-72 shrink-0 bg-muted'
				>
					<FillPhoto src={photo} alt={title} />
				</Link>
			) : (
				<div className='w-2/5 max-w-72 shrink-0 bg-muted' />
			)}
			<div className='flex min-w-0 flex-1 flex-col gap-1 p-4'>
				<div className='flex items-start justify-between gap-3'>
					{offer.propertyId ? (
						<Link
							to={`/all-properties/${offer.propertyId}`}
							className='line-clamp-2 font-medium leading-snug transition-colors duration-200 hover:text-brand'
						>
							{title}
						</Link>
					) : (
						<p className='line-clamp-2 font-medium leading-snug'>{title}</p>
					)}
					<p
						className={cn(
							'shrink-0 text-sm capitalize',
							STATUS_TONE[offer.status] || 'text-muted-foreground',
						)}
					>
						{offer.status}
					</p>
				</div>
				{location ? (
					<p className='truncate text-sm text-muted-foreground'>{location}</p>
				) : null}
				<p className='text-base font-medium tabular-nums'>
					{formatMoney(offer.offerAmount)}
				</p>
				<div className='mt-auto flex flex-wrap items-center justify-between gap-2 pt-3'>
					{agent ? (
						<div className='flex min-w-0 items-center gap-2'>
							<PersonAvatar
								name={agent}
								src={offer.property?.agentImage}
								className='size-8'
							/>
							<p className='truncate text-sm'>{agent}</p>
						</div>
					) : (
						<span />
					)}
					{offer.status === 'accepted' ? (
						<Button size='sm' variant='accent' onClick={onPay} disabled={paying}>
							{paying ? 'Redirecting...' : 'Pay now'}
						</Button>
					) : null}
				</div>
				{offer.status === 'bought' && offer.transactionId ? (
					<p className='text-sm text-success'>
						Transaction {offer.transactionId}
					</p>
				) : null}
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

function OfferSkeleton() {
	return (
		<div className='grid grid-cols-1 gap-4 xl:grid-cols-2' aria-busy='true'>
			<span className='sr-only'>Loading offers</span>
			{Array.from({ length: 4 }, (_, index) => (
				<div
					key={index}
					className='flex min-h-44 overflow-hidden rounded-lg border border-border bg-surface'
				>
					<Skeleton className='w-2/5 max-w-72 rounded-none' />
					<div className='flex-1 space-y-2 p-4'>
						<Skeleton className='h-4 w-3/4' />
						<Skeleton className='h-3 w-1/2' />
						<Skeleton className='h-4 w-2/3' />
					</div>
				</div>
			))}
		</div>
	);
}
