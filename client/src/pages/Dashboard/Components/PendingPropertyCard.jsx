import { Link } from 'react-router';
import { FaMapMarkerAlt, FaUser, FaDollarSign, FaClock } from 'react-icons/fa';

export default function PendingPropertyCard({ property }) {
	console.log(property);
	return (
		<div className='flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface transition-colors duration-200 hover:border-brand'>
			{/* Image */}
			<div className='relative w-full h-48 flex-shrink-0'>
				<img
					src={
						property?.property?.images?.[0]?.url ||
						property?.propertyImage ||
						'/placeholder.jpg'
					}
					alt={property.property.title}
					className='h-full w-full object-cover'
				/>
			</div>

			{/* Content */}
			<div className='p-4 flex flex-col flex-grow'>
				{/* Title */}
				<div>
					<Link
						to={`/all-properties/${property.property._id}`}
						className='font-bold text-lg text-foreground group-hover:text-brand transition-colors duration-300 line-clamp-2'
					>
						{property.property.title}
					</Link>
				</div>

				{/* Location & Agent */}
				<div className='space-y-1 text-muted-foreground text-sm mt-2 mb-4'>
					<p className='flex items-center gap-2'>
						<FaMapMarkerAlt className='text-brand/70' />
						{property.property.location}
					</p>
					<p className='flex items-center gap-2'>
						<FaUser className='text-brand/70' />
						<span className='font-medium'>Agent:</span> {property.agentName}
					</p>
				</div>

				{/* Offer Info */}
				<div className='mt-auto pt-4 border-t border-brand/20'>
					<div className='flex items-center justify-between'>
						<span className='font-medium text-sm'>Offer Amount</span>
						<span className='font-bold text-lg text-brand'>
							${property.offerAmount?.toLocaleString()}
						</span>
					</div>
					<div className='flex items-center justify-between mt-1'>
						<span className='font-medium text-sm'>Status</span>
						<span
							className={`px-2 py-1 rounded-full text-xs font-semibold ${
								property?.status?.toLowerCase() === 'pending'
									? 'bg-warning-soft text-warning'
									: 'bg-success-soft text-success'
							}`}
						>
							{property?.status}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
