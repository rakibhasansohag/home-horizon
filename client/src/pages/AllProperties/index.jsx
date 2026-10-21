import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatMoney } from '@/components/Shared/PropertyCard';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router';
import { cn } from '@/lib/utils';
import useAxios from '../../hooks/useAxios';
import MapView from './MapView';

const bangladeshBounds = {
	swLat: 20.34,
	swLng: 88.02,
	neLat: 26.38,
	neLng: 92.67,
};

export default function AllProperties() {
	const axiosInstance = useAxios();
	const [search, setSearch] = useState('');
	const [sort, setSort] = useState('desc');
	const [bounds, setBounds] = useState(bangladeshBounds);
	const [activeId, setActiveId] = useState(null);
	const [forceFetch, setForceFetch] = useState(false);

	const cardRefs = useRef({});
	const selectFromMap = useRef(false);

	const { data: properties = [], isLoading } = useQuery({
		queryKey: ['all-properties', search, sort, bounds, forceFetch],
		queryFn: async () => {
			const params = new URLSearchParams({
				search: search.toLowerCase(),
				sort,
				...(bounds ? bounds : {}),
			});
			const res = await axiosInstance.get(
				`/properties/verified?${params.toString()}`,
			);
			return res.data;
		},
		enabled: !!bounds,
	});

	const handleSearchChange = (e) => {
		setSearch(e.target.value);
	};

	const handleSortToggle = () => {
		setSort((prev) => (prev === 'asc' ? 'desc' : 'asc'));
	};

	const selectProperty = (id, fromMap = false) => {
		selectFromMap.current = fromMap;
		setActiveId(id);
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
			const isDesktop = window.innerWidth >= 1024;
			if (!isDesktop) {
				setBounds(bangladeshBounds);
			}
		};

		handleResize(); // run once
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return (
		<div className='section space-y-6 py-10'>
			<h1 className='font-display text-3xl text-foreground'>
				All Verified Properties
			</h1>

			<div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
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

			<div className='grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]'>
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1'>
					{isLoading
						? [...Array(6)].map((_, i) => (
								<Skeleton key={i} className='h-28 w-full rounded-lg' />
						  ))
						: properties.map((prop) => {
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
												{prop.title || 'Property'}
											</h2>
											{prop.location ? (
												<p className='truncate text-sm text-muted-foreground'>
													{prop.location}
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
					{!isLoading && properties.length === 0 && (
						<div className='col-span-full text-center text-muted-foreground py-10'>
							<p className='text-lg'>No properties found in this location.</p>
							<p className='text-sm'>
								Try adjusting your map or search filters.
							</p>
							<Button
								type='button'
								className={'mt-4'}
								onClick={() =>
									properties.length === 0
										? window.location.reload()
										: setForceFetch((p) => !p)
								}
							>
								{properties.length === 0 ? 'Reload Page' : 'Retry'}
							</Button>
						</div>
					)}
				</div>

				{/* Right: Map (hidden on small screens) */}
				<div className='sticky top-20 hidden h-[32rem] overflow-hidden rounded-lg border border-border lg:block'>
					<MapView
						properties={properties}
						onBoundsChange={setBounds}
						onMarkerClick={(id) => selectProperty(id, true)}
						activeId={activeId}
					/>
				</div>
			</div>
		</div>
	);
}
