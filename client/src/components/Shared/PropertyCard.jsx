import { Link } from 'react-router';
import { Card } from '@heroui/react/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { homeFacts, listedAmenities } from '@/lib/amenities';

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
	compact = false,
	className,
	onClick,
}) {
	const image = property?.images?.[0]?.url;
	const title = property?.title || 'Property';
	const status = property?.verificationStatus;
	const badge = statusVariant(status);
	const price = `${formatMoney(property?.minPrice)}${
		property?.maxPrice != null &&
		String(property.maxPrice) !== String(property.minPrice)
			? ` – ${formatMoney(property.maxPrice)}`
			: ''
	}`;
	const linked = Boolean(href && !children);
	const facts = homeFacts(property);
	const offered = listedAmenities(property?.amenities)
		.slice(0, 2)
		.map((item) => item.label)
		.join(' · ');

	const titleNode =
		href && !linked ? (
			<Link
				to={href}
				onClick={(event) => event.stopPropagation()}
				className='transition-colors duration-200 hover:text-brand'
			>
				{title}
			</Link>
		) : (
			title
		);

	const card = (
		<Card
			onClick={onClick}
			className={cn(
				'h-full gap-0 overflow-hidden rounded-lg border border-border bg-surface p-0 text-foreground shadow-none transition-colors duration-200 hover:border-brand',
				compact ? 'flex-row' : 'flex-col',
				selected && 'ring-2 ring-brand',
				className,
			)}
		>
			{image ? (
				<img
					src={image}
					alt={title}
					loading='lazy'
					className={
						compact
							? 'h-24 w-28 shrink-0 object-cover sm:h-28 sm:w-32'
							: 'aspect-[4/3] w-full object-cover'
					}
				/>
			) : (
				<div
					className={
						compact
							? 'h-24 w-28 shrink-0 bg-muted sm:h-28 sm:w-32'
							: 'aspect-[4/3] w-full bg-muted'
					}
					role='img'
					aria-label={title}
				/>
			)}
			<Card.Content
				className={cn(
					'min-w-0 flex-1',
					compact ? 'justify-center gap-1 p-3' : 'gap-2 p-4',
				)}
			>
				<Card.Title
					className={cn(
						'font-semibold leading-snug text-foreground',
						compact ? 'line-clamp-2 text-base' : 'line-clamp-2 text-lg',
					)}
				>
					{titleNode}
				</Card.Title>
				{property?.location ? (
					<Card.Description
						className={cn(
							'text-muted-foreground',
							compact ? 'truncate text-sm' : 'text-base',
						)}
					>
						{property.location}
					</Card.Description>
				) : null}
				{!compact && facts ? (
					<p className='text-sm text-muted-foreground'>{facts}</p>
				) : null}
				{!compact && offered ? (
					<p className='truncate text-sm text-muted-foreground'>{offered}</p>
				) : null}
				<p
					className={cn(
						'font-semibold tabular-nums text-foreground',
						compact ? 'text-base' : 'text-xl',
					)}
				>
					{price}
				</p>
				{!compact && property?.agentName ? (
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
				{!compact && badge ? <Badge variant={badge}>{status}</Badge> : null}
				{children ? (
					<div className={compact ? 'pt-1' : 'mt-auto pt-2'}>{children}</div>
				) : null}
			</Card.Content>
		</Card>
	);

	if (linked) {
		return (
			<Link
				to={href}
				className='block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand'
			>
				{card}
			</Link>
		);
	}

	return card;
}
