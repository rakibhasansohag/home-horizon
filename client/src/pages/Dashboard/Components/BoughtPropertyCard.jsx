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

export default function BoughtPropertyCard({ property }) {
	const title = property?.title || 'Listing';
	const photo = property?.images?.[0]?.url || '';
	const boughtOn = formatDay(property?.buyingDate);

	return (
		<article className='flex min-h-40 overflow-hidden rounded-lg border border-border bg-surface'>
			{property?._id ? (
				<Link
					to={`/all-properties/${property._id}`}
					className='relative w-2/5 max-w-56 shrink-0 bg-muted'
				>
					<StripPhoto src={photo} alt={title} />
				</Link>
			) : (
				<div className='relative w-2/5 max-w-56 shrink-0 bg-muted' />
			)}
			<div className='flex min-w-0 flex-1 flex-col gap-1 p-4'>
				<div className='flex items-start justify-between gap-3'>
					{property?._id ? (
						<Link
							to={`/all-properties/${property._id}`}
							className='line-clamp-2 font-medium leading-snug transition-colors duration-200 hover:text-brand'
						>
							{title}
						</Link>
					) : (
						<p className='line-clamp-2 font-medium leading-snug'>{title}</p>
					)}
					<p className='shrink-0 text-sm text-success'>Bought</p>
				</div>
				{property?.location ? (
					<p className='truncate text-sm text-muted-foreground'>
						{property.location}
					</p>
				) : null}
				<p className='text-base font-medium tabular-nums'>
					{formatMoney(property?.offerAmount)}
				</p>
				{boughtOn ? (
					<p className='text-sm text-muted-foreground'>Bought {boughtOn}</p>
				) : null}
				{property?.transactionId ? (
					<p className='truncate text-sm text-success'>
						Transaction {property.transactionId}
					</p>
				) : null}
				{property?.agentName ? (
					<div className='mt-auto flex min-w-0 items-center gap-2 pt-3'>
						<PersonAvatar name={property.agentName} className='size-8' />
						<p className='truncate text-sm'>{property.agentName}</p>
					</div>
				) : null}
			</div>
		</article>
	);
}
