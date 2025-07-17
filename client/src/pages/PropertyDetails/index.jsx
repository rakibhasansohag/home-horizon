import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import ImageGallery from './ImageGallery';
import StickySidebar from './StickySidebar';
import ReviewCard from './ReviewCard';
import ReviewModal from './ReviewModal';

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

	// TODO : will added more details like ( around this home with map  and recommendation properties based on the location or coordination )

	// TODO : we will check if the proprety status is paid/sold/accipted we will make this property add to wihs list or make an offer it will be disbled or do somehting that user can not make any changes  if it's for sale and also we will make the staus as sold if the user paid the price

	return (
		<section>
			<div className='w-full '>
				<ImageGallery images={property.images} />
			</div>
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 section relative '>
				<div className='lg:col-span-2 space-y-6'>
					<Card className='space-y-2 px-4 gap-1'>
						<p>
							<span className='inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2'></span>
							{property.dealStatus === 'sold' ? 'Sold' : 'For Sale'}
						</p>
						<h1 className='text-3xl font-bold'>{property.title}</h1>

						<p className='text-lg font-medium'>
							Price: {property.minPrice} - {property.maxPrice} BDT
						</p>
						<p>Agent: {property.agentName}</p>
					</Card>

					<Card className='border shadow-sm'>
						<CardHeader>
							<CardTitle className='text-2xl font-semibold text-primary'>
								🏡 Property Overview
							</CardTitle>
						</CardHeader>

						<CardContent className='space-y-4 text-sm text-muted-foreground'>
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
									value={`${pricePerSqft} BDT`}
								/>
								<BadgeDetail
									icon={Car}
									label='Parking'
									value={property?.parking ? 'Yes' : 'No'}
								/>
							</div>
						</CardContent>
					</Card>

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
						<Button className='mt-4' onClick={() => setShowReviewModal(true)}>
							Add a Review
						</Button>
						{showReviewModal && (
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
			<Icon className='w-5 h-5 text-primary' />
			<div>
				<p className='text-base font-medium text-foreground'>{value}</p>
				<p className='text-xs text-muted-foreground'>{label}</p>
			</div>
		</div>
	);
}
