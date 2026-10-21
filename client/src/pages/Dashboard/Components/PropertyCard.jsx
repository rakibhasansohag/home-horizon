import PropertyCard from '@/components/Shared/PropertyCard';

export default function DashboardPropertyCard({ property }) {
	return (
		<PropertyCard
			property={property}
			href={property?._id ? `/all-properties/${property._id}` : undefined}
		/>
	);
}
