import { Link } from 'react-router';
import { ChevronRight, MapPin } from 'lucide-react';

function fmtCurrency(v) {
	const n = Number(v || 0);
	if (!Number.isFinite(n)) return '0';
	return n.toLocaleString();
}

export default function AgentPendingCard({ offer, onAccept, onReject }) {
	// defensive access
	if (!offer) return null;

	const prop = offer.property || {};
	const id =
		(prop._id && prop._id.toString && prop._id.toString()) ||
		offer.propertyId ||
		'';
	const title = prop.title || offer.propertyTitle || 'Untitled property';
	const loc = prop.location || offer.propertyLocation || 'Unknown';
	const img =
		(prop.images && prop.images[0] && prop.images[0].url) ||
		offer.propertyImage ||
		'/placeholder.jpg';

	const buyer = offer.buyer || {
		name: offer.buyerName || 'Buyer',
		avatar: offer.buyerImage || '',
	};

	const amount = Number(offer.offerAmount || offer.amount || 0);
	const buyingDate = offer.buyingDate || offer.paidAt || null;
	const status = offer.status || 'pending';

	return (
		<div className='flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface transition-colors duration-200 hover:border-brand'>
			{/* image */}
			<div className='h-44 w-full overflow-hidden'>
				<img
					src={img}
					alt={title}
					className='h-full w-full object-cover'
				/>
			</div>

			<div className='p-4 flex flex-col flex-grow'>
				<div className='flex items-start justify-between'>
					<div>
						<h4 className='text-lg font-semibold line-clamp-2'>{title}</h4>
						<div className='text-sm text-muted-foreground mt-1 flex items-center gap-3'>
							<span className='inline-flex items-center gap-2'>
								<MapPin className='size-4 text-brand' aria-hidden='true' /> {loc}
							</span>
						</div>
					</div>

					<Link
						to={id ? `/all-properties/${id}` : '#'}
						className='ml-3 text-foreground/80 hover:text-brand'
					>
						<ChevronRight className='size-5' aria-hidden='true' />
					</Link>
				</div>

				{/* buyer row */}
				<div className='flex items-center gap-3 mt-3'>
					<img
						src={buyer.avatar || '/default-avatar.png'}
						alt={buyer.name}
						className='w-12 h-12 rounded-full object-cover ring-1 ring-border'
					/>
					<div>
						<div className='text-sm font-medium'>{buyer.name}</div>
						<div className='text-sm text-muted-foreground'>Buyer</div>
					</div>
				</div>

				{/* offer details */}
				<div className='mt-4 text-sm text-muted-foreground'>
					<div className='flex items-center justify-between'>
						<span className='font-medium'>Offer Amount</span>
						<span className='font-semibold text-brand'>
							৳{fmtCurrency(amount)}
						</span>
					</div>

					{buyingDate && (
						<div className='flex items-center justify-between mt-2'>
							<span className='font-medium'>Buying Date</span>
							<span className='text-sm'>
								{new Date(buyingDate).toLocaleDateString()}
							</span>
						</div>
					)}

					<div className='flex items-center justify-between mt-2'>
						<span className='font-medium'>Status</span>
						<span
							className={`rounded-md px-2 py-1 text-sm font-medium ${
								status.toLowerCase() === 'pending'
									? 'bg-warning-soft text-warning'
									: status.toLowerCase() === 'accepted'
									? 'bg-success-soft text-success'
									: 'bg-danger-soft text-destructive'
							}`}
						>
							{status}
						</span>
					</div>
				</div>

				{/* actions */}
				<div className='mt-4 flex gap-2'>
					<button
						onClick={() => onAccept && onAccept(offer._id, offer.propertyId)}
						className='min-h-11 flex-1 rounded-md bg-success-fill text-sm text-surface transition-colors duration-200 hover:bg-success-fill/90'
					>
						Accept
					</button>
					<button
						onClick={() => onReject && onReject(offer._id, offer.propertyId)}
						className='min-h-11 flex-1 rounded-md border border-border text-sm text-foreground transition-colors duration-200 hover:bg-danger-soft'
					>
						Reject
					</button>
				</div>
			</div>
		</div>
	);
}
