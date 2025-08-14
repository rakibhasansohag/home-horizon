import { useQuery, useMutation } from '@tanstack/react-query';
import useAuth from '@/hooks/useAuth';
import useAxiosSecure from '@/hooks/useAxiosSecure';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SkeletonCard from '@/components/Shared/skeletons/SkeletonCard';

// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import ConfirmPaymentModal from '../../../components/Shared/ConfirmPaymentModal';

export default function PropertyBought() {
	const { user } = useAuth();
	const [currentPayingId, setCurrentPayingId] = useState(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedOffer, setSelectedOffer] = useState(null);

	const axiosSecure = useAxiosSecure();

	const { data: offers, isLoading } = useQuery({
		queryKey: ['offers', user?.email],
		queryFn: async () => {
			const res = await axiosSecure.get(`/offers?email=${user?.email}`);
			return res.data;
		},
		enabled: !!user?.email,
	});

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

	if (isLoading) {
		return (
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl'>
				{Array.from({ length: 6 }).map((_, i) => (
					<SkeletonCard key={i} />
				))}
			</div>
		);
	}

	const getStatusColor = (status) => {
		switch (status) {
			case 'pending':
				return 'bg-yellow-100 text-yellow-700';
			case 'accepted':
				return 'bg-blue-100 text-blue-700';
			case 'bought':
				return 'bg-green-100 text-green-700';
			default:
				return 'bg-red-500 text-red-50';
		}
	};

	return (
		<div className='p-6 space-y-4 w-full max-w-7xl'>
			<h2 className='text-2xl font-bold'>Your Property Offers</h2>

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
				{offers?.map((offer) => (
					<Card key={offer._id} className='overflow-hidden pt-0'>
						<img
							src={offer.propertyImage}
							alt='property'
							className='w-full h-48 object-cover'
						/>
						<CardHeader>
							<CardTitle className='text-lg'>{offer.propertyTitle}</CardTitle>
							<p className='text-muted-foreground'>{offer.propertyLocation}</p>
						</CardHeader>
						<CardContent className='space-y-2'>
							<p>
								<span className='font-medium'>Agent:</span> {offer.agentName}
							</p>
							<p>
								<span className='font-medium'>Offer:</span> ৳{offer.offerAmount}
							</p>
							<div>
								<Badge
									className={`capitalize ${getStatusColor(
										offer.status,
									)} px-2 py-1 rounded-md text-sm`}
								>
									{offer.status}
								</Badge>
							</div>

							{offer?.status === 'accepted' && (
								<motion.button
									whileTap={{ scale: 0.95 }}
									whileHover={{ scale: 1.02 }}
									onClick={() => {
										setSelectedOffer(offer);
										setModalOpen(true);
									}}
									className='w-full mt-3 bg-primary text-white px-4 py-2 rounded shadow font-semibold'
								>
									{isPaying && currentPayingId === offer._id
										? 'Redirecting...'
										: 'Pay Now'}
								</motion.button>
							)}

							{offer?.status === 'bought' && (
								<p className='text-green-600 font-semibold mt-2'>
									Transaction ID: {offer.transactionId}
								</p>
							)}
						</CardContent>
					</Card>
				))}
			</div>
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
