import { Link } from 'react-router';
import { Calendar, MapPin, Receipt, User } from 'lucide-react';

export default function BoughtPropertyCard({ property }) {
	return (
		<div className='flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface transition-colors duration-200 hover:border-brand'>
			{/* Image */}
			<div className='relative w-full h-48 flex-shrink-0'>
				<img
					src={property.images?.[0]?.url || '/placeholder.jpg'}
					alt={property.title}
					className='h-full w-full object-cover'
				/>
			</div>

			{/* Content */}
			<div className='p-5 space-y-3 flex flex-col flex-grow'>
				{/* Title */}
				<div>
					<Link
						to={`/all-properties/${property._id}`}
						className='font-bold text-xl text-foreground group-hover:text-brand transition-colors duration-300 line-clamp-2'
					>
						{property.title}
					</Link>
				</div>

				{/* Location & Agent */}
				<div className='space-y-1 text-muted-foreground text-sm'>
					<p className='flex items-center gap-2'>
						<MapPin className='size-4 text-brand' aria-hidden='true' />
						{property.location}
					</p>
					<p className='flex items-center gap-2'>
						<User className='size-4 text-brand' aria-hidden='true' />
						<span className='font-medium'>Agent:</span> {property.agentName}
					</p>
				</div>

				{/* Offer Info */}
				<div className='space-y-1 text-sm text-foreground/80 mt-auto'>
					<p className='flex items-center gap-2'>
						<span className='font-medium'>Offer Amount:</span> ৳
						{property.offerAmount?.toLocaleString()}
					</p>
					<p className='flex items-center gap-2'>
						<Calendar className='size-4 text-brand' aria-hidden='true' />
						<span className='font-medium'>Buying Date:</span>{' '}
						{new Date(property.buyingDate).toLocaleDateString()}
					</p>
					<p className='flex items-center gap-2'>
						<Receipt className='size-4 text-muted-foreground' aria-hidden='true' />
						<span className='font-medium'>Transaction ID:</span>{' '}
						{property.transactionId}
					</p>
				</div>
			</div>
		</div>
	);
}
