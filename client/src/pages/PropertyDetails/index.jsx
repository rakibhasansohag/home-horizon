import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatMoney } from '@/components/Shared/PropertyCard';
import ImageGallery from './ImageGallery';
import StickySidebar from './StickySidebar';
import ReviewCard from './ReviewCard';
import ReviewModal from './ReviewModal';
import AroundHome from './AroundHome';
import Amenities from './Amenities';
import ReviewsDialog, {
	REVIEW_PREVIEW,
	ReviewSummary,
	ShowAllReviews,
} from './ReviewsDialog';

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '../../components/ui/card';
import { CalendarClock, Car, Home, Tag } from 'lucide-react';
import { PropertyDetailsSkeleton } from '../../components/Shared/skeletons/propertyDetailsSkeleton';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';
import EmptyProperties from '../../components/Shared/NotFound/EmptyPerperties';
import useSeo from '@/hooks/useSeo';
import { absoluteUrl, clip } from '@/lib/seo';

export default function PropertyDetails() {
	const { user } = useAuth();
	const { id } = useParams();
	const axiosSecure = useAxiosSecure();
	const [showReviewModal, setShowReviewModal] = useState(false);
	const [showAllReviews, setShowAllReviews] = useState(false);

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

	useSeo(property?.title ? propertySeo(property, reviews) : undefined);

	if (LoadingProperty || LoadingReviews) {
		return <PropertyDetailsSkeleton />;
	}

	if (isError) {
		return <EmptyProperties />;
	}

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
						{property.location ? (
							<p className='text-base text-muted-foreground'>{property.location}</p>
						) : null}
						{listingFacts(property) ? (
							<p className='text-base text-muted-foreground'>
								{listingFacts(property)}
							</p>
						) : null}
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
							{categoryLabels(property.categories).length ? (
								<p>{categoryLabels(property.categories).join(' · ')}</p>
							) : null}

							<div className='mt-2 grid grid-cols-2 gap-4 md:grid-cols-3'>
								<BadgeDetail
									icon={Home}
									label='Type'
									value={property?.propertyType || '—'}
								/>
								<BadgeDetail
									icon={Car}
									label='Parking'
									value={parkingLabel(property?.parking)}
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
								{listedOn(property?.createdAt) ? (
									<BadgeDetail
										icon={CalendarClock}
										label='Listed'
										value={listedOn(property.createdAt)}
									/>
								) : null}
							</div>
						</CardContent>
					</Card>

					<Amenities ids={property.amenities} />

					<AroundHome property={property} />

					{/* Review Section */}
					<div className='space-y-4'>
						<h2 className='text-xl font-semibold'>Reviews</h2>
						<ReviewSummary reviews={reviews} />
						{reviews.length === 0 ? (
							<p className='text-muted-foreground'>
								No reviews yet. Be the first!
							</p>
						) : (
							<div className='grid gap-4 sm:grid-cols-2'>
								{reviews.slice(0, REVIEW_PREVIEW).map((review) => (
									<ReviewCard key={review._id} review={review} />
								))}
							</div>
						)}
						<ShowAllReviews
							count={reviews.length}
							onClick={() => setShowAllReviews(true)}
						/>
						<ReviewsDialog
							open={showAllReviews}
							onOpenChange={setShowAllReviews}
							reviews={reviews}
						/>
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

function propertySeo(property, reviews) {
	const path = `/all-properties/${property._id}`;
	const images = (property.images || []).map((image) => image?.url).filter(Boolean);
	const price =
		property.maxPrice != null && String(property.maxPrice) !== String(property.minPrice)
			? `${formatMoney(property.minPrice)} – ${formatMoney(property.maxPrice)}`
			: formatMoney(property.minPrice);
	const status = property.dealStatus === 'sold' ? 'Sold' : 'For sale';
	const summary = `${[
		property.location ? `${status} in ${property.location}` : status,
		price,
		listingFacts(property),
	]
		.filter(Boolean)
		.join(' · ')}.`;
	const ratings = reviews
		.map((review) => Number(review?.rating))
		.filter((rating) => Number.isFinite(rating) && rating > 0);

	return {
		title: property.location ? `${property.title}, ${property.location}` : property.title,
		description: `${summary} ${property.description || ''}`,
		image: images[0],
		imageAlt: property.title,
		path,
		jsonLd: {
			'@context': 'https://schema.org',
			'@type': 'RealEstateListing',
			name: property.title,
			description: clip(property.description, 500),
			url: absoluteUrl(path),
			image: images,
			datePosted: property.createdAt || undefined,
			offers: {
				'@type': 'Offer',
				priceCurrency: 'BDT',
				price: Number(property.minPrice) || undefined,
				priceSpecification: {
					'@type': 'PriceSpecification',
					priceCurrency: 'BDT',
					minPrice: Number(property.minPrice) || undefined,
					maxPrice: Number(property.maxPrice) || undefined,
				},
				availability:
					property.dealStatus === 'sold'
						? 'https://schema.org/SoldOut'
						: 'https://schema.org/InStock',
				seller: property.agentName
					? { '@type': 'RealEstateAgent', name: property.agentName }
					: undefined,
			},
			aggregateRating: ratings.length
				? {
						'@type': 'AggregateRating',
						ratingValue: (
							ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
						).toFixed(1),
						bestRating: 5,
						reviewCount: ratings.length,
				  }
				: undefined,
		},
	};
}

// eslint-disable-next-line no-unused-vars
function categoryLabels(categories) {
	if (!Array.isArray(categories)) return [];
	return categories
		.map((item) => (typeof item === 'string' ? item : item?.value))
		.map((item) => (typeof item === 'string' ? item.trim() : ''))
		.filter(Boolean);
}

function parkingLabel(value) {
	if (value === true || value === 'yes' || value === 'Yes') return 'Yes';
	if (
		value === false ||
		value === 'no' ||
		value === 'No' ||
		value == null ||
		value === ''
	) {
		return 'No';
	}
	return String(value);
}

function listedOn(value) {
	const date = value ? new Date(value) : null;
	if (!date || Number.isNaN(date.getTime())) return '';
	return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function listingFacts(property) {
	const parts = [];
	if (property?.bedrooms != null && property.bedrooms !== '') {
		parts.push(
			`${property.bedrooms} ${Number(property.bedrooms) === 1 ? 'bedroom' : 'bedrooms'}`,
		);
	}
	if (property?.bathrooms != null && property.bathrooms !== '') {
		parts.push(
			`${property.bathrooms} ${Number(property.bathrooms) === 1 ? 'bathroom' : 'bathrooms'}`,
		);
	}
	if (property?.squareMeters != null && property.squareMeters !== '') {
		parts.push(`${Number(property.squareMeters).toLocaleString('en-US')} sq ft`);
	}
	return parts.join(' · ');
}

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
