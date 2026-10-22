import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatMoney } from '@/components/Shared/PropertyCard';
import { homeFacts } from '@/lib/amenities';
import { Input } from '@/components/ui/input';
import { Link, useSearchParams } from 'react-router';
import { cn } from '@/lib/utils';
import useAxios from '../../hooks/useAxios';
import MapView from './MapView';

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
	const [bounds, setBounds] = useState(null);
	const [activeId, setActiveId] = useState(null);
	const [forceFetch, setForceFetch] = useState(false);

	const cardRefs = useRef({});
	const selectFromMap = useRef(false);
	const locationSearch = search.trim();

	useEffect(() => {
		setSearch(searchParams.get('search') || '');
	}, [searchParams]);

	const { data, isLoading, isFetching, isPlaceholderData } = useQuery({
		queryKey: locationSearch
			? ['all-properties', 'search', locationSearch, sort, forceFetch]
			: ['all-properties', search, sort, bounds, forceFetch],
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
			return res.data;
		},
		enabled: !!locationSearch || !!bounds,
		placeholderData: keepPreviousData,
		staleTime: 5 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
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

			<div className='flex shrink-0 flex-col gap-4 md:flex-row md:items-center md:justify-between'>
				<Input
					placeholder='Search by location...'
					value={search}
					onChange={handleSearchChange}
					className='max-w-md'
				/>
				<Button onClick={handleSortToggle} variant='outline'>
					Sort by Price: {sort === 'asc' ? 'Low to High' : 'High to Low'}
				</Button>
			</div>

			<div className='grid min-h-0 flex-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]'>
				<div className='grid content-start grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:overflow-y-auto lg:pr-1'>
					{shown.length === 0 && (!bounds || isLoading || isFetching)
						? [...Array(6)].map((_, i) => (
								<Skeleton key={i} className='h-28 w-full rounded-lg' />
						  ))
						: shown.map((prop) => {
								const selected = activeId === prop._id;
								const image = prop.images?.[0]?.url;
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
										{image ? (
											<img
												src={image}
												alt={prop.title || 'Property'}
												loading='lazy'
												className='h-20 w-24 shrink-0 rounded-md object-cover'
											/>
										) : (
											<div className='h-20 w-24 shrink-0 rounded-md bg-muted' />
										)}
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
											<div className='mt-1 flex items-center justify-between gap-3'>
												<p className='truncate text-sm font-semibold tabular-nums'>
													{price}
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
					{bounds && !isLoading && !isFetching && shown.length === 0 && (
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

				{/* Right: Map (hidden on small screens) */}
				<div className='hidden min-h-0 overflow-hidden rounded-lg border border-border lg:block'>
					<MapView
						properties={shown}
						onBoundsChange={updateBounds}
						onMarkerClick={(id) => selectProperty(id, true)}
						activeId={activeId}
						fitKey={
							locationSearch ? shown.map((property) => property._id).join(',') : ''
						}
					/>
				</div>
			</div>
		</div>
	);
}
