import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
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
		<div className='p-6 space-y-6'>
			<h2 className='text-2xl font-semibold text-foreground'>
				All Verified Properties
			</h2>

			<div className='flex flex-col md:flex-row gap-4 items-start md:items-center justify-between'>
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

			<div className='grid lg:grid-cols-[1fr_2fr] gap-6'>
				{/* Left: Property Cards */}
				<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
					{isLoading
						? [...Array(6)].map((_, i) => (
								<Skeleton key={i} className='h-60 w-full rounded-xl' />
						  ))
						: properties.map((prop) => (
								<motion.div
									key={prop._id}
									ref={(el) => (cardRefs.current[prop._id] = el)}
									layout
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3 }}
									onClick={() => setActiveId(prop._id)}
								>
									<PropertyCard
										property={prop}
										selected={activeId === prop._id}
									>
										<Link
											to={`/all-properties/${prop._id}`}
											className='inline-flex min-h-11 items-center text-base font-medium text-brand hover:underline'
											onClick={(e) => e.stopPropagation()}
										>
											View Details
										</Link>
									</PropertyCard>
								</motion.div>
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
				<div className='hidden lg:block h-[80vh] rounded-xl overflow-hidden sticky top-20'>
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
