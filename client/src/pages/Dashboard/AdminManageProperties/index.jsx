import { useState } from 'react';
import { Link } from 'react-router';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import PersonAvatar from '@/components/Shared/PersonAvatar';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import { formatMoney } from '@/components/Shared/PropertyCard';
import { gateQuery } from '@/lib/queryWait';
import { cn } from '@/lib/utils';
import {
	FilterSection,
	ShowMore,
	usePreview,
} from '@/pages/Dashboard/Components/DashboardFilter';

const STATUS_TONE = {
	verified: 'text-brand',
	rejected: 'text-destructive',
	pending: 'text-warning',
};

export default function AdminManageProperties() {
	const axiosSecure = useAxiosSecure();
	const { filter, choose, visible, showMore } = usePreview('all');

	const propertiesQuery = useQuery({
		queryKey: ['admin-properties'],
		queryFn: async () => {
			const res = await axiosSecure.get('/admin/properties');
			return res.data;
		},
		placeholderData: keepPreviousData,
	});
	const { data: properties = [], refetch } = propertiesQuery;
	const gate = gateQuery(propertiesQuery);

	const verifyMutation = useMutation({
		mutationFn: (id) => axiosSecure.patch(`/admin/properties/verify/${id}`),
		onSuccess: () => {
			toast.success('Property verified');
			refetch();
		},
		onError: () => toast.error('Verification failed'),
	});

	const rejectMutation = useMutation({
		mutationFn: (id) => axiosSecure.patch(`/admin/properties/reject/${id}`),
		onSuccess: () => {
			toast.success('Property rejected');
			refetch();
		},
		onError: () => toast.error('Rejection failed'),
	});

	const filtered =
		filter === 'all'
			? properties
			: properties.filter((prop) => prop.verificationStatus === filter);
	const rows = filtered.slice(0, visible);

	return (
		<div className='w-full space-y-6'>
			<FilterSection
				label='Status'
				value={filter}
				onChange={choose}
				options={[
					{ value: 'all', label: 'All' },
					{ value: 'pending', label: 'Pending' },
					{ value: 'verified', label: 'Verified' },
					{ value: 'rejected', label: 'Rejected' },
				]}
			/>
			{gate === 'error' ? (
				<div className='space-y-3'>
					<p className='text-destructive'>Could not load properties.</p>
					<Button type='button' variant='outline' onClick={() => refetch()}>
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
							No properties in this status.
						</p>
					) : (
						<div className='space-y-6'>
							<ul className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
								{rows.map((prop) => (
									<ListingRow
										key={prop._id}
										prop={prop}
										onVerify={() => verifyMutation.mutate(prop._id)}
										onReject={() => rejectMutation.mutate(prop._id)}
										busy={
											verifyMutation.isLoading || rejectMutation.isLoading
										}
										verifying={verifyMutation.isLoading}
										rejecting={rejectMutation.isLoading}
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
		</div>
	);
}

function ListingRow({ prop, onVerify, onReject, busy, verifying, rejecting }) {
	const reviewCount = Array.isArray(prop.reviews) ? prop.reviews.length : 0;
	const price = `${formatMoney(prop.minPrice)}${
		prop.maxPrice != null && String(prop.maxPrice) !== String(prop.minPrice)
			? ` – ${formatMoney(prop.maxPrice)}`
			: ''
	}`;
	const pending = prop.verificationStatus === 'pending';

	return (
		<li className='flex min-h-44 overflow-hidden rounded-lg border border-border bg-surface'>
			<Link
				to={`/all-properties/${prop._id}`}
				className='relative w-2/5 max-w-72 shrink-0 bg-muted'
			>
				<ListingPhoto src={prop.images?.[0]?.url} alt={prop.title} />
			</Link>
			<div className='flex min-w-0 flex-1 flex-col gap-1 p-4'>
				<div className='flex items-start justify-between gap-3'>
					<Link
						to={`/all-properties/${prop._id}`}
						className='line-clamp-2 font-medium leading-snug transition-colors duration-200 hover:text-brand'
					>
						{prop.title}
					</Link>
					<p
						className={cn(
							'shrink-0 text-sm capitalize',
							STATUS_TONE[prop.verificationStatus] || 'text-muted-foreground',
						)}
					>
						{prop.verificationStatus}
					</p>
				</div>
				<p className='truncate text-sm text-muted-foreground'>{placeLine(prop)}</p>
				<p className='text-base font-medium tabular-nums'>{price}</p>
				{reviewCount > 0 ? (
					<p className='text-sm text-muted-foreground'>
						{reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
					</p>
				) : null}
				{/* TODO : IN FUTURE we will be adding more tooltip here like how many propeties that user added and aslo how many properties are verified or rejected and also after clicking  and we will be adding a link to visit that user profile only admin can visit that page
				 =>lazy-fetch that info only on hover for better perf */}
				<div className='mt-auto flex min-w-0 items-center gap-2 pt-3'>
					<PersonAvatar
						name={prop.agentName}
						src={prop.agentImage}
						className='size-8'
					/>
					<p className='truncate text-sm' title={prop.agentEmail || undefined}>
						{prop.agentName}
					</p>
				</div>
				{pending ? (
					<div className='flex flex-wrap gap-2 pt-2'>
						<Button size='sm' variant='accent' onClick={onVerify} disabled={busy}>
							{verifying ? 'Verifying...' : 'Verify'}
						</Button>
						<Button
							size='sm'
							variant='ghost'
							className='text-destructive'
							onClick={onReject}
							disabled={busy}
						>
							{rejecting ? 'Rejecting...' : 'Reject'}
						</Button>
					</div>
				) : null}
			</div>
		</li>
	);
}

function placeLine(prop) {
	const type = String(prop.propertyType || '').trim();
	const location = String(prop.location || '').trim();
	const title = String(prop.title || '').toLowerCase();
	if (!type || title.includes(type.toLowerCase())) return location;
	if (!location) return type;
	if (location.toLowerCase().includes(type.toLowerCase())) return location;
	const label = type.charAt(0).toUpperCase() + type.slice(1);
	return `${label} in ${location}`;
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
			<span className='sr-only'>Loading properties</span>
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
