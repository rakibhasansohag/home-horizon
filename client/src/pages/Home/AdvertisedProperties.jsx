import { useQuery } from '@tanstack/react-query';
import useAxios from '../../hooks/useAxios';
import { Link } from 'react-router';
import PropertyCard from '@/components/Shared/PropertyCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdvertisedProperties() {
	const axiosInstance = useAxios();
	const { data: properties = [], isLoading } = useQuery({
		queryKey: ['advertised-properties'],
		queryFn: async () => {
			const res = await axiosInstance.get(
				'/public/advertised-properties?limit=6',
			);
			return res.data;
		},
	});

	if (isLoading) {
		return (
			<section className='bg-paper py-16'>
				<div className='section grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
					{Array.from({ length: 6 }).map((_, i) => (
						<Skeleton key={i} className='aspect-[4/3] w-full rounded-lg' />
					))}
				</div>
			</section>
		);
	}

	if (!properties.length) return null;

	return (
		<section className='bg-paper py-16'>
			<div className='section'>
				<h2 className='font-display text-3xl'>Advertised Properties</h2>
				<div className='mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
					{properties.map((p) => (
						<PropertyCard key={p._id} property={p}>
							<Link
								to={`/all-properties/${p._id}`}
								className='inline-flex min-h-11 items-center text-base font-medium text-brand hover:underline'
							>
								View Details
							</Link>
						</PropertyCard>
					))}
				</div>
			</div>
		</section>
	);
}
