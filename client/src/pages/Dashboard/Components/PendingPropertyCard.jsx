import { Link } from 'react-router';
import { FaMapMarkerAlt, FaUser, FaDollarSign, FaClock } from 'react-icons/fa';

export default function PendingPropertyCard({ property }) {
	console.log(property);
	return (
		<div className='group relative bg-card rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 overflow-hidden border border-border/50 flex flex-col h-full'>
			{/* Image */}
			<div className='relative w-full h-48 flex-shrink-0'>
				<img
					src={
						property?.property?.images?.[0]?.url ||
						property?.propertyImage ||
						'/placeholder.jpg'
					}
					alt={property.property.title}
					className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
				/>
			</div>

			{/* Content */}
			<div className='p-4 flex flex-col flex-grow'>
				{/* Title */}
				<div>
					<Link
						to={`/all-properties/${property.property._id}`}
						className='font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2'
					>
						{property.property.title}
					</Link>
				</div>

				{/* Location & Agent */}
				<div className='space-y-1 text-muted-foreground text-sm mt-2 mb-4'>
					<p className='flex items-center gap-2'>
						<FaMapMarkerAlt className='text-primary/70' />
						{property.property.location}
					</p>
					<p className='flex items-center gap-2'>
						<FaUser className='text-primary/70' />
						<span className='font-medium'>Agent:</span> {property.agentName}
					</p>
				</div>

				{/* Offer Info */}
				<div className='mt-auto pt-4 border-t border-primary/20'>
					<div className='flex items-center justify-between'>
						<span className='font-medium text-sm'>Offer Amount</span>
						<span className='font-bold text-lg text-primary'>
							${property.offerAmount?.toLocaleString()}
						</span>
					</div>
					<div className='flex items-center justify-between mt-1'>
						<span className='font-medium text-sm'>Status</span>
						<span
							className={`px-2 py-1 rounded-full text-xs font-semibold ${
								property?.status?.toLowerCase() === 'pending'
									? 'bg-yellow-500/20 text-yellow-500'
									: 'bg-green-500/20 text-green-500'
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
