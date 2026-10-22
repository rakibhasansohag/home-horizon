import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import useAxios from '@/hooks/useAxios';
import { Skeleton } from '@/components/ui/skeleton';
import { listingSnapshot, readSnapshot, writeSnapshot } from '@/lib/querySnapshot';
import HomeRow from './HomeRow';

const dhakaView = {
	swLat: 23.7,
	swLng: 90.32,
	neLat: 23.9,
	neLng: 90.5,
};
const newestKey = ['newest-homes', 'dhaka'];
const NEWEST_LIMIT = 4;

function byNewest(a, b) {
	return (Date.parse(b?.createdAt || '') || 0) - (Date.parse(a?.createdAt || '') || 0);
}

export default function NewestHomes() {
	const axiosInstance = useAxios();
	const saved = readSnapshot(newestKey);
	const { data: homes = [], isLoading, isError } = useQuery({
		queryKey: newestKey,
		staleTime: 10 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
		refetchOnWindowFocus: false,
		initialData: saved?.data,
		initialDataUpdatedAt: saved?.updatedAt,
		queryFn: async () => {
			const params = new URLSearchParams({
				search: '',
				sort: 'desc',
				...dhakaView,
			});
			const res = await axiosInstance.get(`/properties/verified?${params.toString()}`);
			const list = Array.isArray(res.data)
				? listingSnapshot([...res.data].sort(byNewest)).slice(0, NEWEST_LIMIT)
				: [];
			writeSnapshot(newestKey, list);
			return list;
		},
	});

	if (isLoading) {
		return (
			<section className='bg-surface py-16'>
				<div className='section grid gap-3 sm:grid-cols-2'>
					{Array.from({ length: NEWEST_LIMIT }).map((_, index) => (
						<Skeleton key={index} className='h-28 w-full rounded-lg' />
					))}
				</div>
			</section>
		);
	}

	if (isError || homes.length === 0) return null;

	return (
		<section className='bg-surface py-16'>
			<div className='section'>
				<div className='flex items-end justify-between gap-4'>
					<div>
						<h2 className='font-display text-3xl'>Newest homes</h2>
						<p className='mt-2 text-base text-muted-foreground'>
							The latest verified listings around Dhaka.
						</p>
					</div>
					<Link
						to='/all-properties'
						className='inline-flex min-h-11 shrink-0 items-center text-base font-medium text-brand transition-colors duration-200 hover:underline'
					>
						All properties
					</Link>
				</div>
				<ul className='mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2'>
					{homes.slice(0, NEWEST_LIMIT).map((home) => (
						<HomeRow key={home._id} home={home} />
					))}
				</ul>
			</div>
		</section>
	);
}
