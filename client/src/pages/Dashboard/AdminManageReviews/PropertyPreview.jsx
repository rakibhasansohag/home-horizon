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
			className='flex items-center gap-3 rounded-lg border border-border p-2'
		>
			{property.images?.[0]?.url ? (
				<img
					src={property.images[0].url}
					alt=''
					className='size-12 rounded-md object-cover'
				/>
			) : (
				<div className='size-12 rounded-md bg-muted' />
			)}
			<div className='min-w-0'>
				<p className='truncate text-sm font-medium'>{property.title}</p>
				<p className='truncate text-sm text-muted-foreground'>{property.location}</p>
			</div>
		</Link>
	);
}
