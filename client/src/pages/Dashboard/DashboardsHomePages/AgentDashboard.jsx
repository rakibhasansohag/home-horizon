import React from 'react';
import useAgentDashboard from '@/hooks/useAgentDashboard';
import GlobalLoading from '@/components/Shared/GlobalLoading';
import { toast } from 'react-toastify';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import AgentPendingCard from '../Components/AgentPendingCard';
import AgentSoldCard from '../Components/AgentSoldCard';
import PropertyCard from '../Components/PropertyCard';

import ViewAllCard from '../Components/ViewAllCard';

export default function AgentDashboard() {
	const { dashboard, isLoading, error, refetch } = useAgentDashboard();
	const axios = useAxiosSecure();

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

	const take5 = (arr) => (Array.isArray(arr) ? arr.slice(0, 5) : []);
	const activeListingsSource =
		dashboard.listingsPreview ?? dashboard.listings ?? listings;
	const previews = take5(activeListingsSource);
	const totalCount = listings?.length ?? 0;

	return (
		<div className='p-6 space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold'>Welcome back, {agent.name}</h1>
					<p className='text-sm text-muted-foreground'>
						Agent dashboard overview
					</p>
				</div>
				<img
					src={agent.avatar || '/placeholder-avatar.png'}
					className='w-12 h-12 rounded-full'
				/>
			</div>
			<div className='grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4'>
				<div className='col-span-1 sm:col-span-1 lg:col-span-2 p-4 bg-card rounded-xl'>
					<div className='text-sm text-muted-foreground'>
						Earnings (This month)
					</div>
					<div className='text-2xl font-bold'>
						{stats.earningsMonth?.toLocaleString()}
					</div>
				</div>
				<div className='col-span-1 sm:col-span-1 lg:col-span-2 p-4 bg-card rounded-xl'>
					<div className='text-sm text-muted-foreground'>
						Earnings (Lifetime)
					</div>
					<div className='text-2xl font-bold'>
						{stats.earningsLifetime?.toLocaleString()}
					</div>
				</div>
				<div className='col-span-1 sm:col-span-1 lg:col-span-2 p-4 bg-card rounded-xl'>
					<div className='text-sm text-muted-foreground'>Active listings</div>
					<div className='text-2xl font-bold'>{stats.activeListingsCount}</div>
				</div>
			</div>

			{/* All Active Listing */}
			<div className='grid lg:grid-cols-[2fr_1fr] gap-6'>
				<div className='bg-card p-4 rounded-xl shadow'>
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

				<div className='bg-card p-4 rounded-xl shadow'>
					<h3 className='font-semibold mb-3'>Earnings (last 6 months)</h3>
					<div style={{ width: '100%', height: 160 }}>
						<ResponsiveContainer>
							<LineChart data={earningsSparkline}>
								<Line
									type='monotone'
									dataKey='value'
									stroke='#8884d8'
									strokeWidth={2}
									dot={false}
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>

			{/* // Recent Leads */}
			<div className='bg-card p-4 rounded-xl shadow'>
				<h3 className='font-semibold mb-3'>Recent Leads ({leads.length}) </h3>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch'>
					{take5(leads).map((lead) => (
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
							showCount={take5(leads).length}
							label={
								leads.length > 0
									? `View all ${leads.length}`
									: 'No listings yet'
							}
						/>
					</div>
				</div>
			</div>
			{/* // Sold */}
			<div className='bg-card p-4 rounded-xl shadow'>
				<h3 className='font-semibold mb-3'>Recent Sold</h3>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch'>
					{take5(sold).map((s) => (
						<div key={s._id} className='h-full'>
							<AgentSoldCard sale={s} />
						</div>
					))}
					<div className='h-full'>
						<ViewAllCard
							to='/dashboard/sold-properties'
							count={sold.length}
							showCount={take5(sold).length}
							label={
								sold.length > 0 ? `View all ${sold.length}` : 'No listings yet'
							}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
