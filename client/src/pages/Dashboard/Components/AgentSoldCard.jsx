import { Link } from 'react-router';
import {
	FaMapMarkerAlt,
	FaUser,
	FaReceipt,
	FaChevronRight,
} from 'react-icons/fa';

function fmt(v) {
	const n = Number(v || 0);
	return Number.isFinite(n) ? n.toLocaleString() : '0';
}

export default function AgentSoldCard({ sale }) {
	if (!sale) return null;
	const prop = sale.property || {};
	const id =
		(prop._id && prop._id.toString && prop._id.toString()) ||
		sale.propertyId ||
		'';
	const title = prop.title || sale.propertyTitle || 'Untitled';
	const img =
		(prop.images && prop.images[0] && prop.images[0].url) ||
		prop.propertyImage ||
		'/placeholder.jpg';
	const loc = prop.location || sale.propertyLocation || 'Unknown';
	const buyer = sale.buyer || {
		name: sale.buyerName || 'Buyer',
		avatar: sale.buyerImage || '',
	};
	const amount = sale.amount ?? sale.offerAmount ?? 0;
	const tx = sale.transactionId || sale.tx || '';
	const soldDate = sale.paidAt || sale.buyingDate || sale.updatedAt || null;

	return (
		<div className='bg-card rounded-2xl p-0 overflow-hidden border border-border/50 shadow-md flex flex-col h-full transition-transform duration-300 hover:scale-[1.01]'>
			<div className='h-40 w-full overflow-hidden'>
				<img src={img} alt={title} className='w-full h-full object-cover' />
			</div>

			<div className='p-4 flex flex-col flex-grow'>
				<div className='flex justify-between items-start'>
					<div>
						<h4 className='text-lg font-semibold line-clamp-2'>{title}</h4>
						<div className='text-sm text-muted-foreground mt-1 flex items-center gap-2'>
							<FaMapMarkerAlt className='w-4 h-4 text-primary/80' />
							{loc}
						</div>
					</div>
					<Link
						to={id ? `/all-properties/${id}` : '#'}
						className='ml-3 text-foreground/80 hover:text-primary'
					>
						<FaChevronRight className='w-5 h-5' />
					</Link>
				</div>

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

				<div className='mt-4 text-sm'>
					<div className='flex justify-between'>
						<span className='font-medium'>Amount</span>
						<span className='font-semibold text-primary'>${fmt(amount)}</span>
					</div>

					{soldDate && (
						<div className='flex justify-between mt-2 text-xs text-muted-foreground'>
							<span>Sold on</span>
							<span>{new Date(soldDate).toLocaleDateString()}</span>
						</div>
					)}

					{tx && (
						<div className='flex items-center gap-2 mt-2 text-xs text-muted-foreground'>
							<FaReceipt className='w-4 h-4' />
							<span className='truncate'>Tx: {tx}</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
