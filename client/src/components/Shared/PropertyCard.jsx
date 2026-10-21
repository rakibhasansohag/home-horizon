import { Link } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function formatMoney(value) {
	const amount = Number(value);
	if (!Number.isFinite(amount)) return '—';
	return `৳${amount.toLocaleString('en-US')}`;
}

function statusVariant(status) {
	if (status === 'verified') return 'success';
	if (status === 'rejected') return 'danger';
	if (status) return 'warning';
	return null;
}

export default function PropertyCard({
	property,
	children,
	href,
	selected = false,
	className,
	onClick,
}) {
	const image = property?.images?.[0]?.url;
	const title = property?.title || 'Property';
	const status = property?.verificationStatus;
	const badge = statusVariant(status);

	const titleNode = href ? (
		<Link
			to={href}
			onClick={(event) => event.stopPropagation()}
			className='text-lg font-semibold leading-snug text-foreground hover:text-brand'
		>
			{title}
		</Link>
	) : (
		<h2 className='text-lg font-semibold leading-snug'>{title}</h2>
	);

	return (
		<article
			onClick={onClick}
			className={cn(
				'flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface text-foreground',
				selected && 'ring-2 ring-brand',
				className,
			)}
		>
			{image ? (
				<img
					src={image}
					alt={title}
					loading='lazy'
					className='aspect-[4/3] w-full object-cover'
				/>
			) : (
				<div className='aspect-[4/3] w-full bg-muted' role='img' aria-label={title} />
			)}
			<div className='flex flex-1 flex-col gap-2 p-4'>
				{titleNode}
				{property?.location ? (
					<p className='text-base text-muted-foreground'>{property.location}</p>
				) : null}
				<p className='text-xl font-semibold tabular-nums'>
					{formatMoney(property?.minPrice)}
					{property?.maxPrice != null &&
					String(property.maxPrice) !== String(property.minPrice)
						? ` – ${formatMoney(property.maxPrice)}`
						: ''}
				</p>
				{property?.agentName ? (
					<div className='flex items-center gap-2 text-sm text-muted-foreground'>
						{property.agentImage ? (
							<img
								src={property.agentImage}
								alt=''
								className='size-8 rounded-full object-cover'
							/>
						) : null}
						<span>{property.agentName}</span>
					</div>
				) : null}
				{badge ? <Badge variant={badge}>{status}</Badge> : null}
				{children ? <div className='mt-auto pt-2'>{children}</div> : null}
			</div>
		</article>
	);
}
