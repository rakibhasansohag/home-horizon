import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatMoney } from '@/components/Shared/PropertyCard';
import { homeFacts, listedAmenities } from '@/lib/amenities';
import { Input } from '@/components/ui/input';
import { Link, useSearchParams } from 'react-router';
import { cn } from '@/lib/utils';
import { List, Map as MapIcon } from 'lucide-react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import useAxios from '../../hooks/useAxios';
import useSeo from '@/hooks/useSeo';
import MapView from './MapView';
import { listingSnapshot, readSnapshot, writeSnapshot } from '@/lib/querySnapshot';

const compactView = {
	swLat: 23.7,
	swLng: 90.32,
	neLat: 23.9,
	neLng: 90.5,
};

function inView(property, bounds) {
	const lat = Number(property?.coordinates?.lat);
	const lng = Number(property?.coordinates?.lng);
	if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
	return (
		lat >= bounds.swLat &&
		lat <= bounds.neLat &&
		lng >= bounds.swLng &&
		lng <= bounds.neLng
	);
}

function byPrice(sort) {
	return (a, b) => {
		const delta = Number(a.minPrice) - Number(b.minPrice);
		return sort === 'asc' ? delta : -delta;
	};
}

export default function AllProperties() {
	const axiosInstance = useAxios();
	const queryClient = useQueryClient();
	const [searchParams] = useSearchParams();
	const [search, setSearch] = useState(() => searchParams.get('search') || '');
	const [sort, setSort] = useState('desc');
	const [propertyType, setPropertyType] = useState('all');
	const [mobileView, setMobileView] = useState('list');
	const [bounds, setBounds] = useState(null);
	const [activeId, setActiveId] = useState(null);
	const [forceFetch, setForceFetch] = useState(false);

	const cardRefs = useRef({});
	const selectFromMap = useRef(false);
	const locationSearch = search.trim();
	const searchedPlace = (searchParams.get('search') || '').trim();

	useSeo(
		searchedPlace
			? {
					title: `Homes for Sale in ${searchedPlace}`,
					description: `Verified homes for sale in ${searchedPlace}. Compare prices, photos, and locations on the HomeHorizon map.`,
			  }
			: undefined,
	);

	useEffect(() => {
		setSearch(searchParams.get('search') || '');
	}, [searchParams]);

	const propertiesKey = locationSearch
		? ['all-properties', 'search', locationSearch, sort, forceFetch]
		: ['all-properties', search, sort, bounds, forceFetch];
	const savedProperties =
		!forceFetch && (locationSearch || bounds) ? readSnapshot(propertiesKey) : undefined;

	const { data, isLoading, isFetching, isPlaceholderData } = useQuery({
		queryKey: propertiesKey,
		queryFn: async () => {
			const params = new URLSearchParams({
				search: locationSearch.toLowerCase(),
				sort,
			});
			if (!locationSearch && bounds) {
				params.set('swLat', bounds.swLat);
				params.set('swLng', bounds.swLng);
				params.set('neLat', bounds.neLat);
				params.set('neLng', bounds.neLng);
			}
			const res = await axiosInstance.get(
				`/properties/verified?${params.toString()}`,
			);
			const list = Array.isArray(res.data) ? res.data : [];
			if (!forceFetch) writeSnapshot(propertiesKey, listingSnapshot(list));
			return list;
		},
		enabled: !!locationSearch || !!bounds,
		placeholderData: keepPreviousData,
		initialData: savedProperties?.data,
		initialDataUpdatedAt: savedProperties?.updatedAt,
		staleTime: 10 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
		refetchOnWindowFocus: false,
	});

	const shown = useMemo(() => {
		if (locationSearch) return Array.isArray(data) ? data : [];
		if (!bounds) return [];
		if (Array.isArray(data) && !isPlaceholderData && !isFetching) return data;

		const cached = new Map();
		for (const [, value] of queryClient.getQueriesData({
			queryKey: ['all-properties', search, sort],
		})) {
			if (!Array.isArray(value)) continue;
			for (const property of value) {
				if (inView(property, bounds)) cached.set(property._id, property);
			}
		}
		if (cached.size > 0) return [...cached.values()].sort(byPrice(sort));
		return Array.isArray(data) ? data : [];
	}, [
		bounds,
		data,
		isFetching,
		isPlaceholderData,
		locationSearch,
		queryClient,
		search,
		sort,
	]);

	const filtered = useMemo(() => {
		if (propertyType === 'all') return shown;
		return shown.filter((prop) => {
			const type = String(prop.propertyType || '').toLowerCase();
			return type === propertyType.toLowerCase();
		});
	}, [shown, propertyType]);

	const activeProperty = useMemo(() => {
		if (!activeId) return null;
		return filtered.find((p) => p._id === activeId) || null;
	}, [filtered, activeId]);

	const handleSearchChange = (e) => {
		setSearch(e.target.value);
	};

	const handleSortToggle = () => {
		setSort((prev) => (prev === 'asc' ? 'desc' : 'asc'));
	};

	const updateBounds = useCallback((next) => {
		const round = (value) => Math.round(Number(value) * 1000) / 1000;
		const rounded = {
			swLat: round(next.swLat),
			swLng: round(next.swLng),
			neLat: round(next.neLat),
			neLng: round(next.neLng),
		};
		if (Object.values(rounded).some((value) => !Number.isFinite(value))) return;
		setBounds((current) => {
			if (
				current &&
				current.swLat === rounded.swLat &&
				current.swLng === rounded.swLng &&
				current.neLat === rounded.neLat &&
				current.neLng === rounded.neLng
			) {
				return current;
			}
			return rounded;
		});
	}, []);

	const selectProperty = (id, fromMap = false) => {
		selectFromMap.current = fromMap;
		setActiveId((current) => (current === id ? current : id));
	};

	useEffect(() => {
		if (!activeId || !selectFromMap.current) return;
		selectFromMap.current = false;
		cardRefs.current[activeId]?.scrollIntoView({
			behavior: 'smooth',
			block: 'nearest',
		});
	}, [activeId]);

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth >= 1024) return;
			setBounds((current) => current ?? compactView);
		};

		handleResize(); // run once
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return (
		<div className='section flex flex-col gap-6 py-6 lg:h-[calc(100dvh-4rem)] lg:overflow-hidden'>
			<h1 className='shrink-0 font-display text-3xl text-foreground'>
				All Verified Properties
			</h1>

			<div className='flex shrink-0 flex-col gap-3 md:flex-row md:items-center md:justify-between'>
				<div className='flex flex-1 flex-col gap-3 sm:flex-row sm:items-center'>
					<Input
						placeholder='Search by location...'
						value={search}
						onChange={handleSearchChange}
						className='max-w-md'
					/>
					<Select value={propertyType} onValueChange={setPropertyType}>
						<SelectTrigger className='w-full sm:w-44'>
							<SelectValue placeholder='Property type' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>All Types</SelectItem>
							<SelectItem value='apartment'>Apartment</SelectItem>
							<SelectItem value='house'>House</SelectItem>
							<SelectItem value='villa'>Villa</SelectItem>
							<SelectItem value='studio'>Studio</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className='flex items-center gap-2.5'>
					<Button onClick={handleSortToggle} variant='outline' className='flex-1 sm:flex-initial'>
						Price: {sort === 'asc' ? 'Low to High' : 'High to Low'}
					</Button>

					{/* Mobile List / Map toggle */}
					<div className='inline-flex rounded-lg border border-border bg-surface p-1 lg:hidden'>
						<button
							type='button'
							onClick={() => setMobileView('list')}
							className={cn(
								'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
								mobileView === 'list'
									? 'bg-primary text-primary-foreground shadow-xs'
									: 'text-muted-foreground hover:text-foreground',
							)}
							aria-pressed={mobileView === 'list'}
						>
							<List className='size-4' />
							<span>List</span>
						</button>
						<button
							type='button'
							onClick={() => setMobileView('map')}
							className={cn(
								'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
								mobileView === 'map'
									? 'bg-primary text-primary-foreground shadow-xs'
									: 'text-muted-foreground hover:text-foreground',
							)}
							aria-pressed={mobileView === 'map'}
						>
							<MapIcon className='size-4' />
							<span>Map</span>
						</button>
					</div>
				</div>
			</div>

			<div className='grid min-h-0 flex-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]'>
				<div
					className={cn(
						'grid content-start grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:overflow-y-auto lg:pr-1',
						mobileView === 'map' ? 'hidden lg:grid' : 'grid',
					)}
				>
					{filtered.length === 0 && (!bounds || isLoading || isFetching)
						? [...Array(6)].map((_, i) => (
								<Skeleton key={i} className='h-28 w-full rounded-lg' />
						  ))
						: filtered.map((prop) => {
								const selected = activeId === prop._id;
								const image = prop.images?.[0]?.url;
								const extras = [
									prop.propertyType,
									...listedAmenities(prop.amenities)
										.slice(0, 2)
										.map((item) => item.label),
								].filter(Boolean);
								const price = `${formatMoney(prop.minPrice)}${
									prop.maxPrice != null &&
									String(prop.maxPrice) !== String(prop.minPrice)
										? ` – ${formatMoney(prop.maxPrice)}`
										: ''
								}`;
								return (
									<article
										key={prop._id}
										ref={(el) => (cardRefs.current[prop._id] = el)}
										onMouseEnter={() => selectProperty(prop._id)}
										onClick={() => selectProperty(prop._id)}
										className={cn(
											'flex cursor-pointer gap-3 rounded-lg border bg-surface p-2 transition-colors duration-200',
											selected
												? 'border-brand bg-brand-soft'
												: 'border-border hover:border-brand',
										)}
									>
										<div className='relative min-h-24 w-28 shrink-0 self-stretch overflow-hidden rounded-md bg-muted'>
											{image ? (
												<img
													src={image}
													alt={prop.title || 'Property'}
													loading='lazy'
													className='absolute inset-0 h-full w-full object-cover'
												/>
											) : null}
										</div>
										<div className='flex min-w-0 flex-1 flex-col justify-center gap-0.5 py-1'>
											<h2 className='truncate text-base font-semibold'>
												<Link
													to={`/all-properties/${prop._id}`}
													onClick={(event) => event.stopPropagation()}
													className='transition-colors duration-200 hover:text-brand hover:underline'
												>
													{prop.title || 'Property'}
												</Link>
											</h2>
											{prop.location ? (
												<p className='truncate text-sm text-muted-foreground'>
													{prop.location}
												</p>
											) : null}
											{homeFacts(prop) ? (
												<p className='truncate text-sm text-muted-foreground'>
													{homeFacts(prop)}
												</p>
											) : null}
											{extras.length ? (
												<p className='truncate text-sm capitalize text-muted-foreground'>
													{extras.join(' · ')}
												</p>
											) : null}
											<div className='mt-1 flex items-center justify-between gap-3'>
												<p className='truncate text-sm font-semibold tabular-nums'>
													{price}
													{prop.dealStatus === 'sold' ? (
														<span className='ml-2 font-medium text-muted-foreground'>
															Sold
														</span>
													) : null}
												</p>
												<Link
													to={`/all-properties/${prop._id}`}
													onClick={(event) => event.stopPropagation()}
													className='shrink-0 text-sm font-medium text-brand transition-colors duration-200 hover:underline'
												>
													Details
												</Link>
											</div>
										</div>
									</article>
								);
						  })}
					{bounds && !isLoading && !isFetching && filtered.length === 0 && (
						<div className='col-span-full text-center text-muted-foreground py-10'>
							<p className='text-lg'>No properties found in this location.</p>
							<p className='text-sm'>
								Try adjusting your map or search filters.
							</p>
							<Button
								type='button'
								className={'mt-4'}
								onClick={() => setForceFetch((p) => !p)}
							>
								Retry
							</Button>
						</div>
					)}
				</div>

				{/* Right: Map (split on desktop, toggleable on mobile/tablet) */}
				<div
					className={cn(
						'min-h-0 overflow-hidden rounded-lg border border-border',
						mobileView === 'list'
							? 'hidden lg:block'
							: 'flex flex-col h-[calc(100dvh-17rem)] min-h-[420px] lg:h-auto lg:block',
					)}
				>
					<div className='relative h-full w-full flex-1 min-h-0'>
						<MapView
							properties={filtered}
							onBoundsChange={updateBounds}
							onMarkerClick={(id) => selectProperty(id, true)}
							activeId={activeId}
							fitKey={
								locationSearch
									? filtered.map((property) => property._id).join(',')
									: ''
							}
						/>
					</div>

					{/* Mobile map bottom preview when a pin is selected */}
					{mobileView === 'map' && activeProperty && (
						<div className='border-t border-border bg-surface p-3 lg:hidden'>
							<div className='flex items-center gap-3'>
								<div className='relative h-16 w-20 shrink-0 overflow-hidden rounded-md bg-muted'>
									{activeProperty.images?.[0]?.url && (
										<img
											src={activeProperty.images[0].url}
											alt={activeProperty.title}
											className='h-full w-full object-cover'
										/>
									)}
								</div>
								<div className='min-w-0 flex-1'>
									<p className='truncate text-sm font-medium'>
										{activeProperty.title}
									</p>
									<p className='truncate text-xs text-muted-foreground'>
										{activeProperty.location}
									</p>
									<p className='mt-0.5 text-xs font-semibold tabular-nums'>
										{formatMoney(activeProperty.minPrice)}
										{activeProperty.maxPrice != null &&
										String(activeProperty.maxPrice) !==
											String(activeProperty.minPrice)
											? ` – ${formatMoney(activeProperty.maxPrice)}`
											: ''}
									</p>
								</div>
								<Button asChild size='sm' className='shrink-0'>
									<Link to={`/all-properties/${activeProperty._id}`}>
										Details
									</Link>
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
