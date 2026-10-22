import { Link } from 'react-router';
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

export default function PendingPropertyCard({ property }) {
	const home = property?.property || {};
	const id = home._id || property?.propertyId;
	const title = home.title || property?.propertyTitle || 'Listing';
	const location = home.location || property?.propertyLocation || '';
	const photo = home.images?.[0]?.url || property?.propertyImage || '';
	const agent = property?.agentName || home.agentName || '';
	const status = property?.status || '';

	return (
		<article className='flex min-h-40 overflow-hidden rounded-lg border border-border bg-surface'>
			{id ? (
				<Link
					to={`/all-properties/${id}`}
					className='relative w-2/5 max-w-56 shrink-0 bg-muted'
				>
					<StripPhoto src={photo} alt={title} />
				</Link>
			) : (
				<div className='relative w-2/5 max-w-56 shrink-0 bg-muted'>
					<StripPhoto src={photo} alt={title} />
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
					{status ? (
						<p
							className={cn(
								'shrink-0 text-sm capitalize',
								STATUS_TONE[status.toLowerCase()] || 'text-muted-foreground',
							)}
						>
							{status}
						</p>
					) : null}
				</div>
				{location ? (
					<p className='truncate text-sm text-muted-foreground'>{location}</p>
				) : null}
				<p className='text-base font-medium tabular-nums'>
					{formatMoney(property?.offerAmount)}
				</p>
				{agent ? (
					<div className='mt-auto flex min-w-0 items-center gap-2 pt-3'>
						<PersonAvatar name={agent} className='size-8' />
						<p className='truncate text-sm'>{agent}</p>
					</div>
				) : null}
			</div>
		</article>
	);
}
