import { Link } from 'react-router';
import { formatMoney } from '@/components/Shared/PropertyCard';
import { homeFacts, listedAmenities } from '@/lib/amenities';

export default function HomeRow({ home }) {
	const price = `${formatMoney(home.minPrice)}${
		home.maxPrice != null && String(home.maxPrice) !== String(home.minPrice)
			? ` – ${formatMoney(home.maxPrice)}`
			: ''
	}`;
	const facts = homeFacts(home);
	const extras = [
		home.propertyType,
		...listedAmenities(home.amenities)
			.slice(0, 2)
			.map((item) => item.label),
	].filter(Boolean);
	const photo = home.images?.[0]?.url;

	return (
		<li>
			<Link
				to={`/all-properties/${home._id}`}
				className='flex gap-3 rounded-lg border border-border bg-surface p-2 transition-colors duration-200 hover:border-brand'
			>
				<div className='relative min-h-24 w-28 shrink-0 self-stretch overflow-hidden rounded-md bg-muted'>
					{photo ? (
						<img
							src={photo}
							alt=''
							className='absolute inset-0 h-full w-full object-cover'
						/>
					) : null}
				</div>
				<span className='flex min-w-0 flex-1 flex-col justify-center gap-0.5 py-1'>
					<span className='truncate font-semibold'>{home.title || 'Property'}</span>
					{home.location ? (
						<span className='truncate text-sm text-muted-foreground'>
							{home.location}
						</span>
					) : null}
					{facts ? (
						<span className='truncate text-sm text-muted-foreground'>{facts}</span>
					) : null}
					{extras.length ? (
						<span className='truncate text-sm capitalize text-muted-foreground'>
							{extras.join(' · ')}
						</span>
					) : null}
					<span className='mt-1 text-sm font-semibold tabular-nums'>
						{price}
						{home.dealStatus === 'sold' ? (
							<span className='ml-2 font-medium text-muted-foreground'>Sold</span>
						) : null}
					</span>
				</span>
			</Link>
		</li>
	);
}
