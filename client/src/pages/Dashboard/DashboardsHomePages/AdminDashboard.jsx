import React from 'react';
import useAdminDashboard from '@/hooks/useAdminDashboard';
import GlobalLoading from '@/components/Shared/GlobalLoading';
import StatCard from '@/pages/Dashboard/Components/StatCard';
import RevenueChart from '@/pages/Dashboard/Components/RevenueChart';
import SmallListCard from '@/pages/Dashboard/Components/SmallListCard';
import ViewAllCard from '@/pages/Dashboard/Components/ViewAllCard';
import { Link } from 'react-router';
import PropertyCard from '../Components/PropertyCard';

export default function AdminDashboard() {
	const { dashboard, isLoading, error } = useAdminDashboard();

	if (isLoading) return <GlobalLoading />;
	if (error)
		return (
			<div className='p-6 text-destructive'>Failed to load admin dashboard</div>
		);
	if (!dashboard) return null;

	const {
		totals,

		recentUsers,
		recentProperties,
		recentTransactions,
		pendingAgentApprovals,
		topAgents,
		revenueSparkline,
	} = dashboard;

	return (
		<div className='p-6 space-y-6'>
			<div className='grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-6 gap-4'>
				<StatCard title='Users' value={totals.users} subtitle='Total users' />
				<StatCard
					title='Agents'
					value={totals.agents}
					subtitle='Registered agents'
				/>
				<StatCard
					title='Properties'
					value={totals.properties}
					subtitle='Total properties'
				/>
				<StatCard
					title='Verified'
					value={totals.verifiedProperties}
					subtitle='Verified properties'
				/>
				<StatCard
					title='Advertised'
					value={totals.advertised}
					subtitle='Advertised'
				/>
				<StatCard
					title='Revenue'
					value={`$${(totals.revenue || 0).toLocaleString()}`}
					subtitle='Lifetime'
				/>
			</div>

			<div className='grid lg:grid-cols-[2fr_1fr] gap-6'>
				<div className='bg-card p-4 rounded-xl shadow'>
					<h3 className='font-semibold mb-3'>Earnings (last 6 months)</h3>
					<div style={{ width: '100%', height: 200 }}>
						<RevenueChart data={revenueSparkline} />
					</div>

					<div className='mt-4'>
						<h4 className='font-semibold mb-2'>Recent Transactions</h4>
						<SmallListCard items={recentTransactions} type='transactions' />
						<div className='mt-2'>
							<Link to='/dashboard/payments' className='text-primary'>
								View all transactions
							</Link>
						</div>
					</div>
				</div>

				<div className='bg-card p-4 rounded-xl shadow space-y-4'>
					<div>
						<h4 className='font-semibold'>Top Agents</h4>
						<SmallListCard items={topAgents} type='agents' />
					</div>

					<div>
						<h4 className='font-semibold'>Pending Agent Approvals</h4>
						<SmallListCard items={pendingAgentApprovals} type='pendingAgents' />
						<div className='mt-2'>
							<Link to='/dashboard/manage-users' className='text-primary'>
								Review agents
							</Link>
						</div>
					</div>
				</div>
			</div>

			<div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
				<div className='bg-card p-4 rounded-xl shadow'>
					<h4 className='font-semibold mb-3'>Recent Users</h4>
					<SmallListCard items={recentUsers} type='users' />
					<div className='mt-2'>
						<Link to='/dashboard/manage-users' className='text-primary'>
							View all users
						</Link>
					</div>
				</div>

				<div className='bg-card p-4 rounded-xl shadow col-span-2'>
					<h4 className='font-semibold mb-3'>Recent Properties</h4>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
						{recentProperties.map((p) => (
							<PropertyCard property={p} key={p._id} />
						))}
						<div>
							<ViewAllCard
								to='/dashboard/manage-properties'
								count={totals.properties}
								label='View all properties'
								showCount={recentProperties.length}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
