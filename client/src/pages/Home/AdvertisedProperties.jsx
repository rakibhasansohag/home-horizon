import { useQuery } from '@tanstack/react-query';
import useAxios from '../../hooks/useAxios';
import { Link } from 'react-router';
import PropertyCard from '@/components/Shared/PropertyCard';
import { Skeleton } from '@/components/ui/skeleton';

const PREVIEW_LIMIT = 4;

export default function AdvertisedProperties() {
	const axiosInstance = useAxios();
	const { data: properties = [], isLoading } = useQuery({
		queryKey: ['advertised-properties', PREVIEW_LIMIT],
		queryFn: async () => {
			const res = await axiosInstance.get(
				`/public/advertised-properties?limit=${PREVIEW_LIMIT}`,
			);
			return res.data;
		},
	});

	if (isLoading) {
		return (
			<section className='bg-paper py-16'>
				<div className='section grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
					{Array.from({ length: PREVIEW_LIMIT }).map((_, i) => (
						<Skeleton key={i} className='aspect-[4/3] w-full rounded-lg' />
					))}
				</div>
			</section>
		);
	}

	if (!properties.length) return null;

	const preview = properties.slice(0, PREVIEW_LIMIT);

	return (
		<section className='bg-paper py-16'>
			<div className='section'>
				<div className='flex items-end justify-between gap-4'>
					<h2 className='font-display text-3xl'>Advertised Properties</h2>
					<Link
						to='/all-properties'
						className='inline-flex min-h-11 items-center text-base font-medium text-brand transition-colors duration-200 hover:underline'
					>
						All properties
					</Link>
				</div>
				<div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
					{preview.map((p) => (
						<PropertyCard
							key={p._id}
							href={`/all-properties/${p._id}`}
							property={p}
						/>
					))}
				</div>
			</div>
		</section>
	);
}
