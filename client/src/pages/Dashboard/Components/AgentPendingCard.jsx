import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import PersonAvatar from '@/components/Shared/PersonAvatar';
import { formatMoney } from '@/components/Shared/PropertyCard';
import { cn } from '@/lib/utils';
import { StripPhoto } from './ListingStrip';

const STATUS_TONE = {
	pending: 'text-warning',
	accepted: 'text-brand',
	bought: 'text-success',
	rejected: 'text-destructive',
};

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

export default function AgentPendingCard({ offer, onAccept, onReject }) {
	if (!offer) return null;

	const prop = offer.property || {};
	const id = prop._id || offer.propertyId || '';
	const title = prop.title || offer.propertyTitle || 'Untitled property';
	const loc = prop.location || offer.propertyLocation || '';
	const img = prop.images?.[0]?.url || offer.propertyImage || '';
	const buyer = offer.buyer || {
		name: offer.buyerName || 'Buyer',
		avatar: offer.buyerImage || '',
	};
	const amount = offer.offerAmount ?? offer.amount ?? 0;
	const buyingDate = formatDay(offer.buyingDate || offer.paidAt);
	const status = offer.status || 'pending';

	return (
		<article className='flex h-full min-h-44 overflow-hidden rounded-lg border border-border bg-surface'>
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
					<p
						className={cn(
							'shrink-0 text-sm capitalize',
							STATUS_TONE[status.toLowerCase()] || 'text-muted-foreground',
						)}
					>
						{status}
					</p>
				</div>
				{loc ? (
					<p className='truncate text-sm text-muted-foreground'>{loc}</p>
				) : null}
				<p className='text-base font-medium tabular-nums'>{formatMoney(amount)}</p>
				{buyingDate ? (
					<p className='text-sm text-muted-foreground'>Buying {buyingDate}</p>
				) : null}
				<div className='mt-auto flex flex-wrap items-center justify-between gap-2 pt-3'>
					<div className='flex min-w-0 items-center gap-2'>
						<PersonAvatar
							name={buyer.name}
							src={buyer.avatar}
							className='size-8'
						/>
						<div className='min-w-0'>
							<p className='truncate text-sm'>{buyer.name}</p>
							<p className='text-sm text-muted-foreground'>Buyer</p>
						</div>
					</div>
					<div className='flex flex-wrap gap-2'>
						<Button
							size='sm'
							variant='accent'
							onClick={() => onAccept && onAccept(offer._id, offer.propertyId)}
						>
							Accept
						</Button>
						<Button
							size='sm'
							variant='ghost'
							className='text-destructive'
							onClick={() => onReject && onReject(offer._id, offer.propertyId)}
						>
							Reject
						</Button>
					</div>
				</div>
			</div>
		</article>
	);
}
