import { useState } from 'react';
import useAgentDashboard from '@/hooks/useAgentDashboard';
import GlobalLoading from '@/components/Shared/GlobalLoading';
import { toast } from 'react-toastify';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import AgentPendingCard from '../Components/AgentPendingCard';
import AgentSoldCard from '../Components/AgentSoldCard';
import PropertyCard from '../Components/PropertyCard';

import ViewAllCard from '../Components/ViewAllCard';
import EarningsChart from '../Components/EarningChart';
import MonthlyBarChart from '../Components/MonthlyBarChart';

import { Link } from 'react-router';
import ReviewsCarousel from '../Components/ReviewsCarousel';
import { FilterSection } from '@/pages/Dashboard/Components/DashboardFilter';

export default function AgentDashboard() {
	const { dashboard, isLoading, error, refetch } = useAgentDashboard();
	const axios = useAxiosSecure();
	const [focus, setFocus] = useState('all');

	if (isLoading) return <GlobalLoading />;
	if (error) return <div className='p-6 text-destructive'>Failed to load</div>;

	const { agent, stats, listings, leads, sold, earningsSparkline } = dashboard;
	console.log(dashboard);
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
	const totalCount = listings?.length ?? 0;

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between w-full'>
				<div>
					<h1 className='text-2xl font-bold'>Welcome back, {agent.name}</h1>
					<p className='text-sm text-muted-foreground'>
						Agent dashboard overview
					</p>
				</div>
				<img
					src={agent.avatar || '/placeholder-avatar.png'}
					alt=''
					className='size-12 rounded-full object-cover'
				/>
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
			<div className='grid gap-6 xl:grid-cols-[2fr_1fr]'>
				{showListings ? (
				<div className='rounded-lg border border-border bg-surface p-4 order-1 xl:order-none'>
					<h3 className='font-semibold mb-3'>
						Active Listings{' '}
						{totalCount ? `(Showing ${previews.length} of ${totalCount})` : ''}
					</h3>

					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch'>
						{previews.map((l) => (
							<div key={l._id} className='h-full'>
								<PropertyCard property={l} />
							</div>
						))}

						<div className='h-full'>
							<ViewAllCard
								to='/dashboard/my-property'
								count={totalCount}
								showCount={previews.length}
								label={
									totalCount > 0 ? `View all ${totalCount}` : 'No listings yet'
								}
							/>
						</div>
					</div>
				</div>
				) : null}

				{focus === 'all' ? (
				<div className='space-y-6'>
					<section className='rounded-lg border border-border bg-surface p-4'>
						<h3 className='mb-3 font-semibold'>Monthly earnings</h3>
						<div className='h-52'>
							<MonthlyBarChart data={earningsSparkline} />
						</div>
					</section>
					<section className='rounded-lg border border-border bg-surface p-4'>
						<h3 className='mb-3 font-semibold'>Earnings trend</h3>
						<div className='h-40'>
							<EarningsChart data={earningsSparkline} />
						</div>
					</section>
				</div>
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

					<div className='max-w-[320px] sm:max-w-[450px] mx-auto mt-4'>
						<ReviewsCarousel
							reviews={dashboard.reviewsPreview ?? dashboard.reviews ?? []}
						/>
					</div>
			</section>

			{showLeads ? (
			<div className='rounded-lg border border-border bg-surface p-4'>
				<h3 className='font-semibold mb-3'>Recent Leads ({leads.length}) </h3>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch'>
					{take6(leads).map((lead) => (
						<div
							key={lead._id}
							className='h-full flex flex-col justify-between'
						>
							<AgentPendingCard
								offer={lead}
								onAccept={(offerId, propertyId) =>
									handleOfferAction(offerId, 'accepted', propertyId)
								}
								onReject={(offerId, propertyId) =>
									handleOfferAction(offerId, 'rejected', propertyId)
								}
							/>
						</div>
					))}
					<div className='h-full'>
						<ViewAllCard
							to='/dashboard/agent-offer-properties'
							count={leads.length}
							showCount={take6(leads).length}
							label={
								leads.length > 0
									? `View all ${leads.length}`
									: 'No listings yet'
							}
						/>
					</div>
				</div>
			</div>
			) : null}
			{showSold ? (
			<div className='rounded-lg border border-border bg-surface p-4'>
				<h3 className='font-semibold mb-3'>Recent Sold</h3>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch'>
					{take6(sold).map((s) => (
						<div key={s._id} className='h-full'>
							<AgentSoldCard sale={s} />
						</div>
					))}
					<div className='h-full'>
						<ViewAllCard
							to='/dashboard/sold-properties'
							count={sold.length}
							showCount={take6(sold).length}
							label={
								sold.length > 0 ? `View all ${sold.length}` : 'No listings yet'
							}
						/>
					</div>
				</div>
			</div>
			) : null}
		</div>
	);
}
