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
	ResultSummary,
	ShowMore,
	usePreview,
} from '@/pages/Dashboard/Components/DashboardFilter';

const STATUS_LABEL = {
	all: 'All properties',
	pending: 'Pending review',
	verified: 'Verified',
	rejected: 'Rejected',
};

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
					<ResultSummary label={STATUS_LABEL[filter]} value={filtered.length} />
					{rows.length === 0 ? (
						<p className='text-base text-muted-foreground'>
							No properties in this status.
						</p>
					) : (
						<div className='space-y-6'>
							<ul className='overflow-hidden rounded-lg border border-border bg-surface'>
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
		<li className='flex flex-col gap-3 border-b border-border p-4 last:border-b-0 lg:flex-row lg:items-center lg:justify-between'>
			<div className='flex min-w-0 flex-1 gap-3'>
				<ListingPhoto src={prop.images?.[0]?.url} alt={prop.title} />
				<div className='min-w-0'>
					<Link
						to={`/all-properties/${prop._id}`}
						className='font-medium transition-colors duration-200 hover:text-brand'
					>
						{prop.title}
					</Link>
					<p className='truncate text-sm text-muted-foreground'>{prop.location}</p>
					<p className='text-sm tabular-nums'>{price}</p>
					{reviewCount > 0 ? (
						<p className='text-sm text-muted-foreground'>
							{reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
						</p>
					) : null}
					{/* TODO : IN FUTURE we will be adding more tooltip here like how many propeties that user added and aslo how many properties are verified or rejected and also after clicking  and we will be adding a link to visit that user profile only admin can visit that page
					 =>lazy-fetch that info only on hover for better perf */}
					<div className='mt-2 flex min-w-0 items-center gap-2'>
						<PersonAvatar
							name={prop.agentName}
							src={prop.agentImage}
							className='size-8'
						/>
						<div className='min-w-0'>
							<p className='truncate text-sm'>{prop.agentName}</p>
							<p className='truncate text-sm text-muted-foreground'>
								{prop.agentEmail}
							</p>
						</div>
					</div>
				</div>
			</div>
			<div className='flex flex-wrap items-center gap-2 lg:justify-end'>
				<p
					className={cn(
						'px-1 text-sm capitalize',
						STATUS_TONE[prop.verificationStatus] || 'text-muted-foreground',
					)}
				>
					{prop.verificationStatus}
				</p>
				{prop.propertyType ? (
					<p className='text-sm text-muted-foreground'>{prop.propertyType}</p>
				) : null}
				{pending ? (
					<div className='flex flex-wrap gap-2'>
						<Button
							size='sm'
							variant='accent'
							onClick={onVerify}
							disabled={busy}
						>
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

function ListingPhoto({ src, alt }) {
	const [failed, setFailed] = useState(false);
	if (!src || failed) {
		return <div className='h-20 w-28 shrink-0 rounded-md bg-muted' />;
	}
	return (
		<img
			src={src}
			alt={alt || ''}
			className='h-20 w-28 shrink-0 rounded-md object-cover'
			onError={() => setFailed(true)}
		/>
	);
}

function ListingSkeleton() {
	return (
		<div
			className='overflow-hidden rounded-lg border border-border bg-surface'
			aria-busy='true'
		>
			<span className='sr-only'>Loading properties</span>
			{Array.from({ length: 6 }, (_, index) => (
				<div
					key={index}
					className='flex items-center gap-3 border-b border-border p-4 last:border-b-0'
				>
					<Skeleton className='h-20 w-28 rounded-md' />
					<div className='space-y-2'>
						<Skeleton className='h-4 w-48' />
						<Skeleton className='h-3 w-32' />
						<Skeleton className='h-3 w-40' />
					</div>
				</div>
			))}
		</div>
	);
}
