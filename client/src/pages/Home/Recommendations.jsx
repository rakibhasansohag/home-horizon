import recommendationImg from '@/assets/recommendation-house.webp';
import useAuth from '@/hooks/useAuth';
import useAxios from '@/hooks/useAxios';
import { useQuery } from '@tanstack/react-query';
import { readSnapshot, writeSnapshot, listingSnapshot } from '@/lib/querySnapshot';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router';
import HomeRow from './HomeRow';

const dhakaView = {
	swLat: 23.7,
	swLng: 90.32,
	neLat: 23.9,
	neLng: 90.5,
};
const recommendationKey = ['home-recommendations', 'dhaka'];
const RECOMMENDATION_LIMIT = 3;

function Recommendations() {
	const { user } = useAuth();
	const axiosInstance = useAxios();
	const saved = readSnapshot(recommendationKey);
	const { data: homes = [], isLoading } = useQuery({
		queryKey: recommendationKey,
		enabled: !!user,
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
			const res = await axiosInstance.get(
				`/properties/verified?${params.toString()}`,
			);
			const list = Array.isArray(res.data)
				? listingSnapshot(res.data).slice(0, RECOMMENDATION_LIMIT)
				: [];
			writeSnapshot(recommendationKey, list);
			return list;
		},
	});

	return (
		<section className='bg-surface py-12'>
			<div className='section flex flex-col items-center justify-between gap-8 md:flex-row'>
				<div className='w-full md:w-1/2'>
					{!user ? (
						<div className='flex flex-col items-center text-center md:items-center'>
							<h2 className='text-2xl font-bold'>
								Get home recommendations
							</h2>
							<p className='mt-3 text-base text-muted-foreground'>
								Sign in for a more personalized experience.
							</p>
							<Button variant='outline' asChild className='mt-6'>
								<Link to='/auth/login'>Sign In</Link>
							</Button>
						</div>
					) : isLoading ? (
						<div className='space-y-3'>
							<Skeleton className='h-8 w-56' />
							{Array.from({ length: 3 }).map((_, index) => (
								<Skeleton key={index} className='h-20 w-full rounded-lg' />
							))}
						</div>
					) : homes.length > 0 ? (
						<div>
							<h2 className='text-2xl font-bold'>Recommended homes</h2>
							<p className='mt-2 text-base text-muted-foreground'>
								Verified homes around Dhaka.
							</p>
							<ul className='mt-5 space-y-3'>
								{homes.slice(0, RECOMMENDATION_LIMIT).map((home) => (
									<HomeRow key={home._id} home={home} />
								))}
							</ul>
						</div>
					) : (
						<div className='flex flex-col items-center text-center'>
							<h2 className='text-2xl font-bold'>Recommendations underway</h2>
							<p className='mt-3 text-base text-muted-foreground'>
								Search and save a few homes you like and we’ll find
								recommendations for you.
							</p>
						</div>
					)}
				</div>

				<div className='w-full md:w-1/2'>
					<img
						src={recommendationImg}
						alt='A gray brick house with a front porch'
						className='mx-auto aspect-[4/3] w-full max-w-md rounded-lg object-cover'
					/>
				</div>
			</div>
		</section>
	);
}

export default Recommendations;
