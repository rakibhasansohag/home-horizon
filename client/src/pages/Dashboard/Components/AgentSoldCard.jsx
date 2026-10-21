import { Link } from 'react-router';
import { ChevronRight, MapPin, Receipt } from 'lucide-react';

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
		<div className='flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface transition-colors duration-200 hover:border-brand'>
			<div className='h-40 w-full overflow-hidden'>
				<img src={img} alt={title} className='w-full h-full object-cover' />
			</div>

			<div className='p-4 flex flex-col flex-grow'>
				<div className='flex justify-between items-start'>
					<div>
						<h4 className='text-lg font-semibold line-clamp-2'>{title}</h4>
						<div className='text-sm text-muted-foreground mt-1 flex items-center gap-2'>
							<MapPin className='size-4 text-brand' aria-hidden='true' />
							{loc}
						</div>
					</div>
					<Link
						to={id ? `/all-properties/${id}` : '#'}
						className='ml-3 text-foreground/80 hover:text-brand'
					>
						<ChevronRight className='size-5' aria-hidden='true' />
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
						<div className='text-sm text-muted-foreground'>Buyer</div>
					</div>
				</div>

				<div className='mt-4 text-sm'>
					<div className='flex justify-between'>
						<span className='font-medium'>Amount</span>
						<span className='font-semibold tabular-nums text-brand'>৳{fmt(amount)}</span>
					</div>

					{soldDate && (
						<div className='mt-2 flex justify-between text-sm text-muted-foreground'>
							<span>Sold on</span>
							<span>{new Date(soldDate).toLocaleDateString()}</span>
						</div>
					)}

					{tx && (
						<div className='mt-2 flex items-center gap-2 text-sm text-muted-foreground'>
							<Receipt className='size-4' aria-hidden='true' />
							<span className='truncate'>Tx: {tx}</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
