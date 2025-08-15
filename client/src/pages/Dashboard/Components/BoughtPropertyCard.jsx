import { Link } from 'react-router';
import {
	FaMapMarkerAlt,
	FaUser,
	FaCalendarAlt,
	FaReceipt,
	FaDollarSign,
} from 'react-icons/fa';

export default function BoughtPropertyCard({ property }) {
	return (
		<div className='group relative bg-card rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 overflow-hidden border border-border/50 flex flex-col h-full'>
			{/* Image */}
			<div className='relative w-full h-48 flex-shrink-0'>
				<img
					src={property.images?.[0]?.url || '/placeholder.jpg'}
					alt={property.title}
					className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
				/>
			</div>

			{/* Content */}
			<div className='p-5 space-y-3 flex flex-col flex-grow'>
				{/* Title */}
				<div>
					<Link
						to={`/all-properties/${property._id}`}
						className='font-bold text-xl text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2'
					>
						{property.title}
					</Link>
				</div>

				{/* Location & Agent */}
				<div className='space-y-1 text-muted-foreground text-sm'>
					<p className='flex items-center gap-2'>
						<FaMapMarkerAlt className='text-primary/70' />
						{property.location}
					</p>
					<p className='flex items-center gap-2'>
						<FaUser className='text-primary/70' />
						<span className='font-medium'>Agent:</span> {property.agentName}
					</p>
				</div>

				{/* Offer Info */}
				<div className='space-y-1 text-sm text-foreground/80 mt-auto'>
					<p className='flex items-center gap-2'>
						<FaDollarSign className='text-green-500' />
						<span className='font-medium'>Offer Amount:</span> $
						{property.offerAmount?.toLocaleString()}
					</p>
					<p className='flex items-center gap-2'>
						<FaCalendarAlt className='text-blue-500' />
						<span className='font-medium'>Buying Date:</span>{' '}
						{new Date(property.buyingDate).toLocaleDateString()}
					</p>
					<p className='flex items-center gap-2'>
						<FaReceipt className='text-purple-500' />
						<span className='font-medium'>Transaction ID:</span>{' '}
						{property.transactionId}
					</p>
				</div>
			</div>
		</div>
	);
}
