import recommendationImg from '@/assets/recomand.webp';
import useAuth from '@/hooks/useAuth';
import useAxios from '@/hooks/useAxios';
import { formatMoney } from '@/components/Shared/PropertyCard';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router';

const dhakaView = {
	swLat: 23.7,
	swLng: 90.32,
	neLat: 23.9,
	neLng: 90.5,
};

function Recommendations() {
	const { user } = useAuth();
	const axiosInstance = useAxios();
	const { data: homes = [], isLoading } = useQuery({
		queryKey: ['home-recommendations', 'dhaka'],
		enabled: !!user,
		staleTime: 5 * 60 * 1000,
		queryFn: async () => {
			const params = new URLSearchParams({
				search: '',
				sort: 'desc',
				...dhakaView,
			});
			const res = await axiosInstance.get(
				`/properties/verified?${params.toString()}`,
			);
			return Array.isArray(res.data) ? res.data.slice(0, 4) : [];
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
								{homes.map((home) => {
									const price = `${formatMoney(home.minPrice)}${
										home.maxPrice != null &&
										String(home.maxPrice) !== String(home.minPrice)
											? ` – ${formatMoney(home.maxPrice)}`
											: ''
									}`;
									return (
										<li key={home._id}>
											<Link
												to={`/all-properties/${home._id}`}
												className='flex items-center gap-3 rounded-lg border border-border p-2 transition-colors duration-200 hover:border-brand'
											>
												{home.images?.[0]?.url ? (
													<img
														src={home.images[0].url}
														alt=''
														className='h-16 w-20 shrink-0 rounded-md object-cover'
													/>
												) : (
													<div className='h-16 w-20 shrink-0 rounded-md bg-muted' />
												)}
												<span className='min-w-0'>
													<span className='block truncate font-semibold'>
														{home.title || 'Property'}
													</span>
													<span className='block truncate text-sm text-muted-foreground'>
														{home.location}
													</span>
													<span className='mt-1 block text-sm font-semibold tabular-nums'>
														{price}
													</span>
												</span>
											</Link>
										</li>
									);
								})}
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
						alt='Sample recommendation cards laid over a brick house'
						className='mx-auto h-auto w-full max-w-md'
					/>
				</div>
			</div>
		</section>
	);
}

export default Recommendations;
