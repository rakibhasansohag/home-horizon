import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import PropertyCard from '@/components/Shared/PropertyCard';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router';
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

	useEffect(() => {
		if (activeId && cardRefs.current[activeId]) {
			cardRefs.current[activeId].scrollIntoView({
				behavior: 'smooth',
				block: 'center', // scroll so card is centered vertically
			});
		}
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
						: properties.map((prop) => (
								<div
									key={prop._id}
									ref={(el) => (cardRefs.current[prop._id] = el)}
									onClick={() => setActiveId(prop._id)}
								>
									<PropertyCard
										compact
										property={prop}
										selected={activeId === prop._id}
									>
										<Link
											to={`/all-properties/${prop._id}`}
											className='inline-flex min-h-11 items-center text-base font-medium text-brand transition-colors duration-200 hover:underline'
											onClick={(e) => e.stopPropagation()}
										>
											View Details
										</Link>
									</PropertyCard>
								</div>
						  ))}
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
						onMarkerClick={setActiveId}
						activeId={activeId}
					/>
				</div>
			</div>
		</div>
	);
}
