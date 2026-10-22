import { useState } from 'react';
import { Link } from 'react-router';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import PersonAvatar from '@/components/Shared/PersonAvatar';
import { formatMoney } from '@/components/Shared/PropertyCard';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import { gateQuery } from '@/lib/queryWait';
import {
	FilterSection,
	ShowMore,
	usePreview,
} from '@/pages/Dashboard/Components/DashboardFilter';

function inThisMonth(value) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return false;
	const now = new Date();
	return (
		date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
	);
}

export default function AgentSoldProperties() {
	const axiosSecure = useAxiosSecure();
	const { filter, choose, visible, showMore } = usePreview('all');

	const soldQuery = useQuery({
		queryKey: ['agent-sold-properties'],
		placeholderData: keepPreviousData,
		queryFn: async () => {
			const res = await axiosSecure.get('/agent/sold-properties');
			return res.data;
		},
	});
	const sold = soldQuery.data ?? [];
	const gate = gateQuery(soldQuery);

	const filtered =
		filter === 'month' ? sold.filter((item) => inThisMonth(item.paidAt)) : sold;
	const rows = filtered.slice(0, visible);
	const totalSold = filtered.reduce(
		(acc, item) => acc + Number(item.offerAmount || 0),
		0,
	);

	return (
		<div className='w-full space-y-6'>
			<FilterSection
				label='Period'
				value={filter}
				onChange={choose}
				options={[
					{ value: 'all', label: 'All time' },
					{ value: 'month', label: 'This month' },
				]}
			/>
			{gate === 'error' ? (
				<p className='text-destructive'>Could not load sold properties.</p>
			) : gate === 'loading' ? (
				<SoldSkeleton />
			) : (
				<>
					<p className='text-sm text-muted-foreground'>
						{filtered.length} sold
						{filtered.length ? ` · ${formatMoney(totalSold)}` : ''}
					</p>
					{rows.length === 0 ? (
						<p className='text-base text-muted-foreground'>
							No sales in this period.
						</p>
					) : (
						<div className='space-y-6'>
							<ul className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
								{rows.map((item) => (
									<SoldRow key={item._id} item={item} />
								))}
							</ul>
							<ShowMore
								shown={rows.length}
								total={filtered.length}
								onMore={showMore}
							/>
						</div>
					)}
				</>
			)}
		</div>
	);
}

function SoldRow({ item }) {
	const title = item.propertyTitle || item.title || 'Listing';
	const when = item.paidAt
		? new Date(item.paidAt).toLocaleDateString('en-BD')
		: '';

	return (
		<li className='flex min-h-44 overflow-hidden rounded-lg border border-border bg-surface'>
			{item.propertyId ? (
				<Link
					to={`/all-properties/${item.propertyId}`}
					className='relative w-2/5 max-w-72 shrink-0 bg-muted'
				>
					<FillPhoto src={item.propertyImage} alt={title} />
				</Link>
			) : (
				<div className='relative w-2/5 max-w-72 shrink-0 bg-muted'>
					<FillPhoto src={item.propertyImage} alt={title} />
				</div>
			)}
			<div className='flex min-w-0 flex-1 flex-col gap-1 p-4'>
				{item.propertyId ? (
					<Link
						to={`/all-properties/${item.propertyId}`}
						className='line-clamp-2 font-medium leading-snug transition-colors duration-200 hover:text-brand'
					>
						{title}
					</Link>
				) : (
					<p className='line-clamp-2 font-medium leading-snug'>{title}</p>
				)}
				{item.propertyLocation ? (
					<p className='truncate text-sm text-muted-foreground'>
						{item.propertyLocation}
					</p>
				) : null}
				<p className='text-base font-medium tabular-nums text-success'>
					{formatMoney(item.offerAmount)}
				</p>
				<div className='mt-auto flex flex-wrap items-center justify-between gap-2 pt-3'>
					<div className='flex min-w-0 items-center gap-2'>
						<PersonAvatar
							name={item.buyerName}
							src={item.buyerImage}
							className='size-8'
						/>
						<div className='min-w-0'>
							<p className='truncate text-sm'>{item.buyerName}</p>
							{item.buyerEmail ? (
								<p className='truncate text-sm text-muted-foreground'>
									{item.buyerEmail}
								</p>
							) : null}
						</div>
					</div>
					{when ? (
						<p className='shrink-0 text-sm text-muted-foreground'>{when}</p>
					) : null}
				</div>
			</div>
		</li>
	);
}

function FillPhoto({ src, alt }) {
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

function SoldSkeleton() {
	return (
		<div className='grid grid-cols-1 gap-4 xl:grid-cols-2' aria-busy='true'>
			<span className='sr-only'>Loading sold properties</span>
			{Array.from({ length: 4 }, (_, index) => (
				<div
					key={index}
					className='flex min-h-44 overflow-hidden rounded-lg border border-border bg-surface'
				>
					<Skeleton className='w-2/5 max-w-72 rounded-none' />
					<div className='flex-1 space-y-2 p-4'>
						<Skeleton className='h-4 w-3/4' />
						<Skeleton className='h-3 w-1/2' />
						<Skeleton className='h-4 w-2/3' />
					</div>
				</div>
			))}
		</div>
	);
}
