import { Link } from 'react-router';
import PersonAvatar from '@/components/Shared/PersonAvatar';
import { formatMoney } from '@/components/Shared/PropertyCard';
import { StripPhoto } from './ListingStrip';

function formatDay(value) {
	if (!value) return '';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '';
	return date.toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
}

export default function AgentSoldCard({ sale }) {
	if (!sale) return null;
	const prop = sale.property || {};
	const id = prop._id || sale.propertyId || '';
	const title = prop.title || sale.propertyTitle || 'Untitled';
	const img = prop.images?.[0]?.url || sale.propertyImage || '';
	const loc = prop.location || sale.propertyLocation || '';
	const buyer = sale.buyer || {
		name: sale.buyerName || 'Buyer',
		avatar: sale.buyerImage || '',
	};
	const amount = sale.amount ?? sale.offerAmount ?? 0;
	const tx = sale.transactionId || sale.tx || '';
	const soldDate = formatDay(sale.paidAt || sale.buyingDate || sale.updatedAt);

	return (
		<article className='flex min-h-40 overflow-hidden rounded-lg border border-border bg-surface'>
			{id ? (
				<Link
					to={`/all-properties/${id}`}
					className='relative w-2/5 max-w-56 shrink-0 bg-muted'
				>
					<StripPhoto src={img} alt={title} />
				</Link>
			) : (
				<div className='relative w-2/5 max-w-56 shrink-0 bg-muted'>
					<StripPhoto src={img} alt={title} />
				</div>
			)}
			<div className='flex min-w-0 flex-1 flex-col gap-1 p-4'>
				<div className='flex items-start justify-between gap-3'>
					{id ? (
						<Link
							to={`/all-properties/${id}`}
							className='line-clamp-2 font-medium leading-snug transition-colors duration-200 hover:text-brand'
						>
							{title}
						</Link>
					) : (
						<p className='line-clamp-2 font-medium leading-snug'>{title}</p>
					)}
					<p className='shrink-0 text-sm text-success'>Sold</p>
				</div>
				{loc ? (
					<p className='truncate text-sm text-muted-foreground'>{loc}</p>
				) : null}
				<p className='text-base font-medium tabular-nums'>{formatMoney(amount)}</p>
				{soldDate ? (
					<p className='text-sm text-muted-foreground'>Sold {soldDate}</p>
				) : null}
				{tx ? <p className='truncate text-sm text-success'>Transaction {tx}</p> : null}
				<div className='mt-auto flex min-w-0 items-center gap-2 pt-3'>
					<PersonAvatar name={buyer.name} src={buyer.avatar} className='size-8' />
					<div className='min-w-0'>
						<p className='truncate text-sm'>{buyer.name}</p>
						<p className='text-sm text-muted-foreground'>Buyer</p>
					</div>
				</div>
			</div>
		</article>
	);
}
