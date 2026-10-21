import { useQuery } from '@tanstack/react-query';
import useAxios from '../../hooks/useAxios';
import { Link } from 'react-router';
import PropertyCard from '@/components/Shared/PropertyCard';

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

	if (isLoading) return <p>Loading advertised properties...</p>;

	if (!properties.length) return null;

	return (
		<section className='px-4 py-16 bg-background'>
			<div className='space-y-4 section'>
				<h2 className='text-2xl font-semibold mb-10'>Advertised Properties</h2>
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
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
