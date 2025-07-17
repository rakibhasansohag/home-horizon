import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import { Link } from 'react-router';

export default function PropertyPreview({ propertyId }) {
	const axiosSecure = useAxiosSecure();

	const { data: property } = useQuery({
		queryKey: ['property-preview', propertyId],
		queryFn: async () => {
			const res = await axiosSecure.get(`/properties/${propertyId}`);
			return res.data;
		},
		enabled: !!propertyId,
	});

	console.log(property);

	if (!property) return null;

	return (
		<Link
			to={'/all-properties/' + property._id}
			target={'_blank'}
			className='flex items-center gap-3 mt-4 border rounded p-2'
		>
			<img
				src={property.images[0]?.url || '/placeholder.png'}
				alt={property.title}
				className='w-12 h-12 rounded object-cover'
			/>
			<div>
				<p className='text-sm font-medium'>{property.title}</p>
				<p className='text-xs text-muted-foreground'>{property.location}</p>
			</div>
		</Link>
	);
}
