import { useState } from 'react';
import { Link } from 'react-router';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import PersonAvatar from '@/components/Shared/PersonAvatar';
import ConfirmActionModal from '@/components/shared/ConfirmActionModal';
import { formatMoney } from '@/components/Shared/PropertyCard';
import { gateQuery } from '@/lib/queryWait';
import { cn } from '@/lib/utils';
import { toast } from 'react-toastify';
import {
	FilterSection,
	ShowMore,
	usePreview,
} from '@/pages/Dashboard/Components/DashboardFilter';

export default function AdminAdvertiseProperty() {
	const axios = useAxiosSecure();
	const qc = useQueryClient();

	const [selected, setSelected] = useState(null);
	const { filter, choose, visible, showMore } = usePreview('all');

	const propertiesQuery = useQuery({
		queryKey: ['admin‐verified-properties'],
		queryFn: () => axios.get('/admin/verified-properties').then((r) => r.data),
		placeholderData: keepPreviousData,
	});
	const { data: properties = [] } = propertiesQuery;
	const gate = gateQuery(propertiesQuery);

	const advertiseM = useMutation({
		mutationFn: (id) => axios.patch(`/admin/advertise-property/${id}`),
		onSuccess: () => {
			toast.success('Property advertised');
			qc.invalidateQueries({ queryKey: ['admin‐verified-properties'] });
			qc.invalidateQueries({ queryKey: ['advertise-stats'] });
			setSelected(null);
		},
		onError: () => toast.error('Failed to advertise'),
	});

	const unadvertiseM = useMutation({
		mutationFn: (id) => axios.patch(`/admin/unadvertise-property/${id}`),
		onSuccess: () => {
			toast.success('Property un‑advertised');
			qc.invalidateQueries({ queryKey: ['admin‐verified-properties'] });
			qc.invalidateQueries({ queryKey: ['advertise‐stats'] });
			setSelected(null);
		},
		onError: () => toast.error('Failed to un‑advertise'),
	});

	const filtered =
		filter === 'advertised'
			? properties.filter((property) => property.isAdvertised)
			: filter === 'available'
				? properties.filter((property) => !property.isAdvertised)
				: properties;
	const rows = filtered.slice(0, visible);
	const ask = (property) =>
		setSelected({
			id: property._id,
			title: property.title,
			isAdvertised: Boolean(property.isAdvertised),
		});

	return (
		<div className='w-full space-y-6'>
			<FilterSection
				label='Listings'
				value={filter}
				onChange={choose}
				options={[
					{ value: 'all', label: 'All' },
					{ value: 'advertised', label: 'Advertised' },
					{ value: 'available', label: 'Not advertised' },
				]}
			/>
			{gate === 'error' ? (
				<div className='space-y-3'>
					<p className='text-destructive'>Could not load listings.</p>
					<Button type='button' variant='outline' onClick={() => propertiesQuery.refetch()}>
						Try again
					</Button>
				</div>
			) : gate === 'loading' ? (
				<ListingSkeleton />
			) : (
				<>
					<p className='text-sm text-muted-foreground'>
						{filtered.length} {filtered.length === 1 ? 'home' : 'homes'}
					</p>
					{rows.length === 0 ? (
						<p className='text-base text-muted-foreground'>
							No listings for this filter.
						</p>
					) : (
						<div className='space-y-6'>
							<ul className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
								{rows.map((property) => (
									<AdvertiseRow
										key={property._id}
										property={property}
										onAsk={() => ask(property)}
									/>
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

			{/* Confirmation Modal */}
			{selected && (
				<ConfirmActionModal
					isOpen={!!selected}
					onClose={() => setSelected(null)}
					title={
						selected.isAdvertised
							? 'Un‑advertise this property?'
							: 'Advertise this property?'
					}
					description={
						selected.isAdvertised
							? `Take ${selected.title} off the home page?`
							: `Show ${selected.title} on the home page?`
					}
					actionLabel={selected.isAdvertised ? 'Un‑advertise' : 'Advertise'}
					loading={advertiseM.isLoading || unadvertiseM.isLoading}
					onConfirm={() => {
						if (selected.isAdvertised) {
							unadvertiseM.mutate(selected.id);
						} else {
							advertiseM.mutate(selected.id);
						}
					}}
				/>
			)}
		</div>
	);
}

const TAKE_DOWN = 'Un\u2011advertise';

function AdvertiseRow({ property, onAsk }) {
	const advertised = Boolean(property.isAdvertised);
	const price = `${formatMoney(property.minPrice)}${
		property.maxPrice != null &&
		String(property.maxPrice) !== String(property.minPrice)
			? ` – ${formatMoney(property.maxPrice)}`
			: ''
	}`;

	return (
		<li className='flex min-h-44 overflow-hidden rounded-lg border border-border bg-surface'>
			<Link
				to={`/all-properties/${property._id}`}
				className='relative w-2/5 max-w-72 shrink-0 bg-muted'
			>
				<ListingPhoto src={property.images?.[0]?.url} alt={property.title} />
			</Link>
			<div className='flex min-w-0 flex-1 flex-col gap-1 p-4'>
				<div className='flex items-start justify-between gap-3'>
					<Link
						to={`/all-properties/${property._id}`}
						className='line-clamp-2 font-medium leading-snug transition-colors duration-200 hover:text-brand'
					>
						{property.title}
					</Link>
					<p
						className={cn(
							'shrink-0 text-sm',
							advertised ? 'text-brand' : 'text-muted-foreground',
						)}
					>
						{advertised ? 'Advertised' : 'Not advertised'}
					</p>
				</div>
				<p className='truncate text-sm text-muted-foreground'>{property.location}</p>
				<p className='text-base font-medium tabular-nums'>{price}</p>
				<div className='mt-auto flex flex-wrap items-center justify-between gap-2 pt-3'>
					<div className='flex min-w-0 items-center gap-2'>
						<PersonAvatar
							name={property.agentName}
							src={property.agentImage}
							className='size-8'
						/>
						<p className='truncate text-sm' title={property.agentEmail || undefined}>
							{property.agentName}
						</p>
					</div>
					<Button
						size='sm'
						variant={advertised ? 'outline' : 'accent'}
						onClick={onAsk}
					>
						{advertised ? TAKE_DOWN : 'Advertise'}
					</Button>
				</div>
			</div>
		</li>
	);
}

function ListingPhoto({ src, alt }) {
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

function ListingSkeleton() {
	return (
		<div className='grid grid-cols-1 gap-4 xl:grid-cols-2' aria-busy='true'>
			<span className='sr-only'>Loading listings</span>
			{Array.from({ length: 6 }, (_, index) => (
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
