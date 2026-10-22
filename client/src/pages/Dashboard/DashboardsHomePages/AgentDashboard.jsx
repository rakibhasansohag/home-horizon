import { useState } from 'react';
import useAgentDashboard from '@/hooks/useAgentDashboard';
import DashboardSkeleton from '@/components/Shared/skeletons/DashboardSkeleton';
import { gateQuery } from '@/lib/queryWait';
import { toast } from 'react-toastify';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import AgentPendingCard from '../Components/AgentPendingCard';
import AgentSoldCard from '../Components/AgentSoldCard';
import ListingStrip from '../Components/ListingStrip';
import PersonAvatar from '@/components/Shared/PersonAvatar';

import ViewAllCard from '../Components/ViewAllCard';
import RevenueChart from '../Components/RevenueChart';
import ChartFallback from '../Components/ChartFallback';

import { Link } from 'react-router';
import ReviewsCarousel from '../Components/ReviewsCarousel';
import { FilterSection } from '@/pages/Dashboard/Components/DashboardFilter';

export default function AgentDashboard() {
	const dashboardQuery = useAgentDashboard();
	const { dashboard, refetch } = dashboardQuery;
	const axios = useAxiosSecure();
	const [focus, setFocus] = useState('all');

	const gate = gateQuery({ ...dashboardQuery, data: dashboard });
	if (gate === 'loading') return <DashboardSkeleton />;
	if (gate === 'error')
		return <div className='p-6 text-destructive'>Could not load your dashboard.</div>;

	const { agent, stats, listings, leads, sold, earningsSparkline } = dashboard;
	async function handleOfferAction(offerId, status, propertyId) {
		try {
			await axios.patch(`/agent/offers/${offerId}/status`, {
				status,
				propertyId,
			});
			toast.success(`Offer ${status}`);
			refetch();
		} catch (err) {
			console.error(err);
			toast.error('Action failed');
		}
	}

	const take6 = (arr) => (Array.isArray(arr) ? arr.slice(0, 6) : []);
	const activeListingsSource =
		dashboard.listingsPreview ?? dashboard.listings ?? listings;
	const previews = take6(activeListingsSource);
	const showListings = focus === 'all' || focus === 'listings';
	const showLeads = focus === 'all' || focus === 'leads';
	const showSold = focus === 'all' || focus === 'sold';
	const monthlyEarnings = (earningsSparkline || []).reduce(
		(sum, item) => sum + Number(item.value || 0),
		0,
	);
	const totalCount = listings?.length ?? 0;

	return (
		<div className='min-w-0 space-y-6'>
			<div className='flex flex-col items-center gap-4 rounded-lg border border-border bg-surface p-6 sm:flex-row sm:justify-between'>
				<div className='text-center sm:text-left'>
					<h1 className='font-display text-3xl text-foreground'>
						Welcome back, {agent.name}
					</h1>
					<p className='mt-1 text-base text-muted-foreground'>
						Agent dashboard overview
					</p>
				</div>
				<PersonAvatar name={agent.name} src={agent.avatar} className='size-16' />
			</div>
			<FilterSection
				label='Show'
				value={focus}
				onChange={setFocus}
				options={[
					{ value: 'all', label: 'All' },
					{ value: 'listings', label: 'Listings' },
					{ value: 'leads', label: 'Leads' },
					{ value: 'sold', label: 'Sold' },
				]}
			/>
			<div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
				{(focus === 'all' || focus === 'listings') && (
					<div className='rounded-lg border border-border bg-surface p-4'>
						<div className='text-sm text-muted-foreground'>Active listings</div>
						<div className='text-2xl font-bold'>{stats.activeListingsCount}</div>
					</div>
				)}
				{focus === 'all' && (
					<div className='rounded-lg border border-border bg-surface p-4'>
						<div className='text-sm text-muted-foreground'>
							Earnings (This month)
						</div>
						<div className='text-2xl font-bold tabular-nums'>
							৳{Number(stats.earningsMonth || 0).toLocaleString()}
						</div>
					</div>
				)}
				{focus === 'all' && (
					<div className='rounded-lg border border-border bg-surface p-4'>
						<div className='text-sm text-muted-foreground'>
							Earnings (Lifetime)
						</div>
						<div className='text-2xl font-bold tabular-nums'>
							৳{Number(stats.earningsLifetime || 0).toLocaleString()}
						</div>
					</div>
				)}
				{focus === 'leads' && (
					<div className='rounded-lg border border-border bg-surface p-4'>
						<div className='text-sm text-muted-foreground'>Open leads</div>
						<div className='text-2xl font-bold'>{leads.length}</div>
					</div>
				)}
				{focus === 'sold' && (
					<div className='rounded-lg border border-border bg-surface p-4'>
						<div className='text-sm text-muted-foreground'>Sold</div>
						<div className='text-2xl font-bold'>{sold.length}</div>
					</div>
				)}
			</div>

			{/* All Active Listing */}
			<div className='grid min-w-0 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]'>
				{showListings ? (
				<div className='rounded-lg border border-border bg-surface p-4 order-1 xl:order-none'>
					<h3 className='font-semibold mb-3'>
						Active Listings{' '}
						{totalCount ? `(Showing ${previews.length} of ${totalCount})` : ''}
					</h3>

					<div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
						{previews.map((listing) => (
							<ListingStrip key={listing._id} property={listing} />
						))}
					</div>
					<ViewAllCard
						to='/dashboard/my-property'
						count={totalCount}
						showCount={previews.length}
						label={
							totalCount > 0 ? `View all ${totalCount}` : 'No listings yet'
						}
					/>
				</div>
				) : null}

				{focus === 'all' ? (
				<section className='rounded-lg border border-border bg-surface p-4'>
					<h3 className='mb-3 font-semibold'>Monthly earnings</h3>
					<div className='h-52'>
						{monthlyEarnings > 0 ? (
							<RevenueChart data={earningsSparkline} />
						) : (
							<ChartFallback
								title='No dated earnings'
								message='None of the last 6 months has a payment date, so there is no earnings trend to draw.'
							/>
						)}
					</div>
				</section>
				) : null}
			</div>

			<section className='rounded-lg border border-border bg-surface p-4'>
					<div className='flex items-center justify-between'>
						<div>
							<h4 className='text-lg font-semibold'>Reviews</h4>
							<p className='text-sm text-muted-foreground'>
								{dashboard.reviewsCount ?? dashboard.reviews?.length ?? 0}{' '}
								reviews · Avg rating:{' '}
								{dashboard.ratingAvg ? dashboard.ratingAvg.toFixed(1) : '—'}
							</p>
						</div>
						<div>
							<Link
								to='/dashboard/manage-reviews'
								className='text-brand text-sm'
							>
								Manage
							</Link>
						</div>
					</div>

					<div className='mt-4'>
						<ReviewsCarousel
							reviews={dashboard.reviewsPreview ?? dashboard.reviews ?? []}
						/>
					</div>
			</section>

			{showLeads ? (
			<div className='rounded-lg border border-border bg-surface p-4'>
				<h3 className='font-semibold mb-3'>Recent Leads ({leads.length}) </h3>
				<div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
					{take6(leads).map((lead) => (
						<AgentPendingCard
							key={lead._id}
							offer={lead}
							onAccept={(offerId, propertyId) =>
								handleOfferAction(offerId, 'accepted', propertyId)
							}
							onReject={(offerId, propertyId) =>
								handleOfferAction(offerId, 'rejected', propertyId)
							}
						/>
					))}
				</div>
				<ViewAllCard
					to='/dashboard/agent-offer-properties'
					count={leads.length}
					showCount={take6(leads).length}
					label={
						leads.length > 0 ? `View all ${leads.length}` : 'No listings yet'
					}
				/>
			</div>
			) : null}
			{showSold ? (
			<div className='rounded-lg border border-border bg-surface p-4'>
				<h3 className='font-semibold mb-3'>Recent Sold</h3>
				<div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
					{take6(sold).map((sale) => (
						<AgentSoldCard key={sale._id} sale={sale} />
					))}
				</div>
				<ViewAllCard
					to='/dashboard/sold-properties'
					count={sold.length}
					showCount={take6(sold).length}
					label={sold.length > 0 ? `View all ${sold.length}` : 'No listings yet'}
				/>
			</div>
			) : null}
		</div>
	);
}
