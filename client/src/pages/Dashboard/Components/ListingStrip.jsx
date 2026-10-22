import { useState } from 'react';
import { Link } from 'react-router';
import PersonAvatar from '@/components/Shared/PersonAvatar';
import { formatMoney } from '@/components/Shared/PropertyCard';
import { cn } from '@/lib/utils';

export function StripFrame({ to, src, alt, wide = false }) {
	const [failed, setFailed] = useState(false);
	if (!src || failed) return null;
	const frame = `relative w-2/5 shrink-0 bg-muted ${wide ? 'max-w-72' : 'max-w-56'}`;
	const image = (
		<img
			src={src}
			alt={alt || ''}
			className='absolute inset-0 h-full w-full object-cover'
			onError={() => setFailed(true)}
		/>
	);
	if (!to) return <div className={frame}>{image}</div>;
	return (
		<Link to={to} className={frame}>
			{image}
		</Link>
	);
}

export function StripPhoto({ src, alt }) {
	const [failed, setFailed] = useState(false);
	if (!src || failed) return null;
	return (
		<img
			src={src}
			alt={alt || ''}
			className='absolute inset-0 h-full w-full object-cover'
			onError={() => setFailed(true)}
		/>
	);
}

export default function ListingStrip({
	property,
	status,
	statusClassName,
}) {
	const id = property?._id;
	const title = property?.title || 'Listing';
	const photo = property?.images?.[0]?.url || '';
	const price =
		property?.minPrice != null
			? `${formatMoney(property.minPrice)}${
					property?.maxPrice != null &&
					String(property.maxPrice) !== String(property.minPrice)
						? ` – ${formatMoney(property.maxPrice)}`
						: ''
				}`
			: '';

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
						<p className={cn('shrink-0 text-sm capitalize', statusClassName)}>
							{status}
						</p>
					) : null}
				</div>
				{property?.location ? (
					<p className='truncate text-sm text-muted-foreground'>
						{property.location}
					</p>
				) : null}
				{price ? (
					<p className='text-base font-medium tabular-nums'>{price}</p>
				) : null}
				{property?.agentName ? (
					<div className='mt-auto flex min-w-0 items-center gap-2 pt-3'>
						<PersonAvatar
							name={property.agentName}
							src={property.agentImage}
							className='size-8'
						/>
						<p className='truncate text-sm'>{property.agentName}</p>
					</div>
				) : null}
			</div>
		</article>
	);
}
