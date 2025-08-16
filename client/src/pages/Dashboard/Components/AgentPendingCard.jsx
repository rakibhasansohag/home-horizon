import { Link } from 'react-router';
import { FaMapMarkerAlt, FaUser, FaChevronRight } from 'react-icons/fa';

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
		<div className='bg-card rounded-2xl overflow-hidden border border-border/50 shadow-md flex flex-col h-full transform transition-transform duration-300 hover:-translate-y-1 '>
			{/* image */}
			<div className='h-44 w-full overflow-hidden'>
				<img
					src={img}
					alt={title}
					className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
				/>
			</div>

			<div className='p-4 flex flex-col flex-grow'>
				<div className='flex items-start justify-between'>
					<div>
						<h4 className='text-lg font-semibold line-clamp-2'>{title}</h4>
						<div className='text-sm text-muted-foreground mt-1 flex items-center gap-3'>
							<span className='inline-flex items-center gap-2'>
								<FaMapMarkerAlt className='w-4 h-4 text-primary/80' /> {loc}
							</span>
						</div>
					</div>

					<Link
						to={id ? `/all-properties/${id}` : '#'}
						className='ml-3 text-foreground/80 hover:text-primary'
					>
						<FaChevronRight className='w-5 h-5' />
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
						<div className='text-xs text-muted-foreground'>Buyer</div>
					</div>
				</div>

				{/* offer details */}
				<div className='mt-4 text-sm text-muted-foreground'>
					<div className='flex items-center justify-between'>
						<span className='font-medium'>Offer Amount</span>
						<span className='font-semibold text-primary'>
							${fmtCurrency(amount)}
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
							className={`px-2 py-1 rounded-full text-xs font-semibold ${
								status.toLowerCase() === 'pending'
									? 'bg-yellow-500/20 text-yellow-500'
									: status.toLowerCase() === 'accepted'
									? 'bg-green-500/20 text-green-500'
									: 'bg-red-500/20 text-red-500'
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
						className='flex-1 rounded-xl py-2 text-sm bg-green-600 text-white hover:bg-green-700 transition'
					>
						Accept
					</button>
					<button
						onClick={() => onReject && onReject(offer._id, offer.propertyId)}
						className='flex-1 rounded-xl py-2 text-sm border border-border text-foreground hover:bg-red-600/5 transition'
					>
						Reject
					</button>
				</div>
			</div>
		</div>
	);
}
