import { useQuery } from '@tanstack/react-query';
import useAxios from '../../hooks/useAxios';
import { Link } from 'react-router';

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
		<section className='px-4 py-8 bg-accent'>
			<div className=' space-y-4 section'>
				<h2 className='text-2xl font-bold text-center mb-10'>
					Advertised Properties
				</h2>
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
					{properties.map((p) => (
						<div
							key={p._id}
							className='bg-white border rounded-md shadow hover:shadow-lg transition'
						>
							<img
								src={p.images?.[0]?.url}
								alt={p.title}
								className='h-48 w-full object-cover rounded-t'
							/>
							<div className='p-4 space-y-1'>
								<p className='font-semibold'>{p.location}</p>
								<p className='text-sm text-muted-foreground'>
									৳{p.minPrice.toLocaleString()} – ৳
									{p.maxPrice.toLocaleString()}
								</p>
								<p
									className={`inline-block text-xs font-medium rounded-full px-2 py-1 ${
										p.verificationStatus === 'verified'
											? 'bg-green-100 text-green-700'
											: 'bg-yellow-100 text-yellow-700'
									}`}
								>
									{p.verificationStatus}
								</p>
								<div className='pt-2'>
									<Link
										to={`/all-properties/${p._id}`}
										className='text-blue-500 text-sm underline'
									>
										View Details
									</Link>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
