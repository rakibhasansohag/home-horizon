import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatMoney } from '@/components/Shared/PropertyCard';
import ImageGallery from './ImageGallery';
import StickySidebar from './StickySidebar';
import ReviewCard from './ReviewCard';
import ReviewModal from './ReviewModal';
import AroundHome from './AroundHome';

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '../../components/ui/card';
import { CalendarClock, Car, Home, Ruler, Tag } from 'lucide-react';
import { PropertyDetailsSkeleton } from '../../components/Shared/skeletons/propertyDetailsSkeleton';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';
import EmptyProperties from '../../components/Shared/NotFound/EmptyPerperties';

export default function PropertyDetails() {
	const { user } = useAuth();
	const { id } = useParams();
	const axiosSecure = useAxiosSecure();
	const [showReviewModal, setShowReviewModal] = useState(false);

	const { data: offer } = useQuery({
		queryKey: ['property-offer', user?.email, id],
		enabled: !!user?.email && !!id,
		queryFn: async () => {
			const res = await axiosSecure.get('/offers/user', {
				params: { email: user.email, propertyId: id },
			});
			return res.data;
		},
	});
	const hasBought = offer?.status === 'bought';

	const {
		data: property,
		isLoading: LoadingProperty,
		isError,
	} = useQuery({
		queryKey: ['property-details', id],
		queryFn: async () => {
			const res = await axiosSecure.get(`/properties/${id}`);
			return res.data;
		},
	});

	const {
		data: reviews = [],
		isLoading: LoadingReviews,
		refetch: refetchReviews,
	} = useQuery({
		queryKey: ['property-reviews', id],
		queryFn: async () => {
			const res = await axiosSecure.get(`/reviews/${id}`);
			return res.data;
		},
	});

	const pricePerSqft = Math.floor(property?.minPrice / property?.squareMeters);

	const yearBuilt = Math.floor(Math.random() * 105 + 1900);

	useEffect(() => {
		if (property?.title) {
			document.title = `${property.title} | HomeHorizon`;
		} else {
			document.title = `Property Details | HomeHorizon`;
		}
	}, [property]);

	if (LoadingProperty || LoadingReviews) {
		return <PropertyDetailsSkeleton />;
	}

	if (isError) {
		return <EmptyProperties />;
	}

	// TODO : we will check if the proprety status is paid/sold/accipted we will make this property add to wihs list or make an offer it will be disbled or do somehting that user can not make any changes  if it's for sale and also we will make the staus as sold if the user paid the price

	return (
		<section className='pb-16'>
			<ImageGallery images={property.images} />
			<div className='section relative grid grid-cols-1 gap-8 py-8 lg:grid-cols-3'>
				<div className='space-y-6 lg:col-span-2'>
					<div className='space-y-2'>
						<p className='text-sm text-success'>
							{property.dealStatus === 'sold' ? 'Sold' : 'For Sale'}
						</p>
						<h1 className='font-display text-3xl'>{property.title}</h1>
						<p className='text-xl font-semibold tabular-nums'>
							{formatMoney(property.minPrice)} – {formatMoney(property.maxPrice)}
						</p>
						<p className='text-base text-muted-foreground'>
							Agent: {property.agentName}
						</p>
					</div>

					<Card className='border shadow-none'>
						<CardHeader>
							<CardTitle className='text-2xl font-semibold'>
								Property Overview
							</CardTitle>
						</CardHeader>

						<CardContent className='space-y-4 text-base text-muted-foreground'>
							<p>{property.description}</p>

							<div className='grid grid-cols-2 md:grid-cols-3 gap-4 mt-2'>
								<BadgeDetail
									icon={CalendarClock}
									label='Listed Since'
									value='1 Day'
								/>
								<BadgeDetail
									icon={Home}
									label='Type'
									value={property?.propertyType}
								/>
								<BadgeDetail
									icon={CalendarClock}
									label='Year Built'
									value={yearBuilt}
								/>
								<BadgeDetail
									icon={Ruler}
									label='Area'
									value={`${property?.squareMeters} sq ft`}
								/>
								<BadgeDetail
									icon={Tag}
									label='Price/Sq.Ft'
									value={
										Number.isFinite(pricePerSqft)
											? formatMoney(pricePerSqft)
											: '—'
									}
								/>
								<BadgeDetail
									icon={Car}
									label='Parking'
									value={property?.parking ? 'Yes' : 'No'}
								/>
							</div>
						</CardContent>
					</Card>

					<AroundHome property={property} />

					{/* Review Section */}
					<div>
						<h2 className='text-xl font-semibold mt-10'>User Reviews</h2>
						<div className='grid sm:grid-cols-2 gap-4 mt-4'>
							{reviews.length === 0 ? (
								<p className='text-muted-foreground'>
									No reviews yet. Be the first!
								</p>
							) : (
								reviews
									.slice(0, 6)
									.map((review) => (
										<ReviewCard key={review._id} review={review} />
									))
							)}
						</div>
						{hasBought ? (
							<Button className='mt-4' onClick={() => setShowReviewModal(true)}>
								Add a Review
							</Button>
						) : (
							<p className='mt-4 text-sm text-muted-foreground'>
								You can write a review after you buy this home.
							</p>
						)}
						{hasBought && showReviewModal && (
							<ReviewModal
								user={user}
								propertyId={property._id}
								agentId={property.agentId}
								onClose={() => setShowReviewModal(false)}
								onSuccess={refetchReviews}
								agentName={property.agentName}
								propertyTitle={property.title}
							/>
						)}
					</div>
				</div>

				<div className='sticky top-20'>
					<StickySidebar
						propertyId={property._id}
						dealStatus={property.dealStatus}
					/>
				</div>
			</div>
		</section>
	);
}

// eslint-disable-next-line no-unused-vars
function BadgeDetail({ icon: Icon, label, value }) {
	return (
		<div className='flex items-center gap-3 p-3 bg-accent rounded-md'>
			<Icon className='w-5 h-5 text-brand' />
			<div>
				<p className='text-base font-medium text-foreground'>{value}</p>
				<p className='text-sm text-muted-foreground'>{label}</p>
			</div>
		</div>
	);
}
