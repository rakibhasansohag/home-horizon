import { useState } from 'react';
import { Link } from 'react-router';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import PersonAvatar from '@/components/Shared/PersonAvatar';
import { formatMoney } from '@/components/Shared/PropertyCard';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import useAuth from '@/hooks/useAuth';
import { gateQuery } from '@/lib/queryWait';
import { cn } from '@/lib/utils';
import {
	FilterSection,
	ShowMore,
	usePreview,
} from '@/pages/Dashboard/Components/DashboardFilter';

const STATUS_TONE = {
	pending: 'text-warning',
	accepted: 'text-brand',
	rejected: 'text-destructive',
	bought: 'text-success',
};

export default function AgentOffersPage() {
	const { user } = useAuth();
	const axios = useAxiosSecure();
	const queryClient = useQueryClient();
	const { filter, choose, visible, showMore } = usePreview('all');

	const offersQuery = useQuery({
		queryKey: ['agent-offers', user?.uid],
		enabled: !!user?.uid,
		placeholderData: keepPreviousData,
		queryFn: async () => {
			const res = await axios.get(`/agent/offers?uid=${user.uid}`);
			return res.data;
		},
	});
	const offers = offersQuery.data ?? [];
	const gate = gateQuery(offersQuery);

	const mutation = useMutation({
		mutationFn: ({ offerId, newStatus, propertyId }) =>
			axios.patch(`/agent/offers/${offerId}/status`, {
				status: newStatus,
				propertyId,
			}),
		onSuccess: () => {
			toast.success('Offer status updated');
			queryClient.invalidateQueries(['agent-offers']);
		},
		onError: (err) =>
			toast.error(err.response.data.error || 'Something went wrong'),
	});

	const filtered =
		filter === 'all' ? offers : offers.filter((offer) => offer.status === filter);
	const rows = filtered.slice(0, visible);
	const offerTotal = filtered.reduce(
		(sum, offer) => sum + Number(offer.offerAmount || 0),
		0,
	);

	return (
		<div className='w-full space-y-6'>
			<FilterSection
				label='Status'
				value={filter}
				onChange={choose}
				options={[
					{ value: 'all', label: 'All' },
					{ value: 'pending', label: 'Pending' },
					{ value: 'accepted', label: 'Accepted' },
					{ value: 'rejected', label: 'Rejected' },
				]}
			/>
			{gate === 'error' ? (
				<p className='text-destructive'>Could not load requested offers.</p>
			) : gate === 'loading' ? (
				<OfferSkeleton />
			) : (
				<>
					<p className='text-sm text-muted-foreground'>
						{filtered.length} {filtered.length === 1 ? 'offer' : 'offers'}
						{filtered.length ? ` · ${formatMoney(offerTotal)}` : ''}
					</p>
					{rows.length === 0 ? (
						<p className='text-base text-muted-foreground'>
							No offers in this status.
						</p>
					) : (
						<div className='space-y-6'>
							<ul className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
								{rows.map((offer) => (
									<OfferRow
										key={offer._id}
										offer={offer}
										busy={mutation.isPending}
										onAccept={() =>
											mutation.mutate({
												offerId: offer._id,
												newStatus: 'accepted',
												propertyId: offer?.propertyId,
											})
										}
										onReject={() =>
											mutation.mutate({
												offerId: offer._id,
												newStatus: 'rejected',
												propertyId: offer?.propertyId,
											})
										}
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

function OfferRow({ offer, busy, onAccept, onReject }) {
	const title = offer.propertyTitle || 'Listing';

	return (
		<li className='flex min-h-44 overflow-hidden rounded-lg border border-border bg-surface'>
			{offer.propertyId ? (
				<Link
					to={`/all-properties/${offer.propertyId}`}
					className='relative w-2/5 max-w-72 shrink-0 bg-muted'
				>
					<FillPhoto src={offer.propertyImage} alt={title} />
				</Link>
			) : (
				<div className='relative w-2/5 max-w-72 shrink-0 bg-muted'>
					<FillPhoto src={offer.propertyImage} alt={title} />
				</div>
			)}
			<div className='flex min-w-0 flex-1 flex-col gap-1 p-4'>
				<div className='flex items-start justify-between gap-3'>
					{offer.propertyId ? (
						<Link
							to={`/all-properties/${offer.propertyId}`}
							className='line-clamp-2 font-medium leading-snug transition-colors duration-200 hover:text-brand'
						>
							{title}
						</Link>
					) : (
						<p className='line-clamp-2 font-medium leading-snug'>{title}</p>
					)}
					<p
						className={cn(
							'shrink-0 text-sm capitalize',
							STATUS_TONE[offer.status] || 'text-muted-foreground',
						)}
					>
						{offer.status}
					</p>
				</div>
				{offer.propertyLocation ? (
					<p className='truncate text-sm text-muted-foreground'>
						{offer.propertyLocation}
					</p>
				) : null}
				<p className='text-base font-medium tabular-nums'>
					{formatMoney(offer.offerAmount)}
				</p>
				<div className='mt-auto flex flex-wrap items-center justify-between gap-2 pt-3'>
					<div className='flex min-w-0 items-center gap-2'>
						<PersonAvatar
							name={offer.buyerName}
							src={offer.buyerImage}
							className='size-8'
						/>
						<div className='min-w-0'>
							<p className='truncate text-sm'>{offer.buyerName}</p>
							{offer.buyerEmail ? (
								<p
									className='truncate text-sm text-muted-foreground'
									title={offer.buyerEmail}
								>
									{offer.buyerEmail}
								</p>
							) : null}
						</div>
					</div>
					{offer.status === 'pending' ? (
						<div className='flex flex-wrap gap-2'>
							<Button size='sm' variant='accent' onClick={onAccept} disabled={busy}>
								Accept
							</Button>
							<Button
								size='sm'
								variant='ghost'
								className='text-destructive'
								onClick={onReject}
								disabled={busy}
							>
								Reject
							</Button>
						</div>
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

function OfferSkeleton() {
	return (
		<div className='grid grid-cols-1 gap-4 xl:grid-cols-2' aria-busy='true'>
			<span className='sr-only'>Loading offers</span>
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
