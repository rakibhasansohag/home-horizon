import { useState } from 'react';
import useAdminDashboard from '@/hooks/useAdminDashboard';
import GlobalLoading from '@/components/Shared/GlobalLoading';
import StatCard from '@/pages/Dashboard/Components/StatCard';
import RevenueChart from '@/pages/Dashboard/Components/RevenueChart';
import MonthlyBarChart from '@/pages/Dashboard/Components/MonthlyBarChart';
import SmallListCard from '@/pages/Dashboard/Components/SmallListCard';
import ViewAllCard from '@/pages/Dashboard/Components/ViewAllCard';
import { FilterSection } from '@/pages/Dashboard/Components/DashboardFilter';
import { Link } from 'react-router';
import PropertyCard from '../Components/PropertyCard';

const PREVIEW = 6;

export default function AdminDashboard() {
	const { dashboard, isLoading, error } = useAdminDashboard();
	const [focus, setFocus] = useState('all');

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

	const monthlyTotal = (revenueSparkline || []).reduce(
		(sum, item) => sum + Number(item.value || 0),
		0,
	);
	const agentBars = (topAgents || []).map((agent) => ({
		label: agent.name || 'Agent',
		value: Number(agent.total || 0),
	}));
	const barData = monthlyTotal > 0 ? revenueSparkline : agentBars;
	const barTitle = monthlyTotal > 0 ? 'Monthly revenue' : 'Earnings by agent';
	const sales = (recentTransactions || []).slice(0, PREVIEW);
	const agents = (topAgents || []).slice(0, PREVIEW);
	const pending = (pendingAgentApprovals || []).slice(0, PREVIEW);
	const users = (recentUsers || []).slice(0, PREVIEW);
	const properties = (recentProperties || []).slice(0, PREVIEW);
	const showSales = focus === 'all' || focus === 'sales';
	const showPeople = focus === 'all' || focus === 'people';
	const showListings = focus === 'all' || focus === 'listings';

	return (
		<div className='space-y-6'>
			<FilterSection
				label='Show'
				value={focus}
				onChange={setFocus}
				options={[
					{ value: 'all', label: 'All' },
					{ value: 'sales', label: 'Sales' },
					{ value: 'people', label: 'People' },
					{ value: 'listings', label: 'Listings' },
				]}
			/>

			{focus === 'all' ? (
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
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
						value={`৳${(totals.revenue || 0).toLocaleString()}`}
						subtitle='Lifetime'
					/>
				</div>
			) : null}

			{focus === 'sales' ? (
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
					<StatCard
						title='Revenue'
						value={`৳${(totals.revenue || 0).toLocaleString()}`}
						subtitle='Lifetime'
					/>
					<StatCard
						title='Latest sales'
						value={sales.length}
						subtitle='Shown below'
					/>
				</div>
			) : null}

			{focus === 'people' ? (
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
					<StatCard title='Users' value={totals.users} subtitle='Total users' />
					<StatCard
						title='Agents'
						value={totals.agents}
						subtitle='Registered agents'
					/>
					<StatCard
						title='Waiting'
						value={(pendingAgentApprovals || []).length}
						subtitle='Agent approvals in this list'
					/>
				</div>
			) : null}

			{focus === 'listings' ? (
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
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
				</div>
			) : null}

			{showSales ? (
				<section className='rounded-lg border border-border bg-surface p-4'>
					<div className='grid gap-6 lg:grid-cols-2'>
						<div>
							<h3 className='mb-3 font-semibold'>{barTitle}</h3>
							<div className='h-56'>
								{barData.length > 0 ? (
									<MonthlyBarChart data={barData} />
								) : (
									<p className='py-16 text-sm text-muted-foreground'>
										No earnings to chart yet.
									</p>
								)}
							</div>
						</div>
						<div>
							<h3 className='mb-3 font-semibold'>Earnings trend</h3>
							<div className='h-56'>
								{monthlyTotal > 0 ? (
									<RevenueChart data={revenueSparkline} />
								) : (
									<p className='py-16 text-sm text-muted-foreground'>
										No dated sales in the last 6 months.
									</p>
								)}
							</div>
						</div>
					</div>
				</section>
			) : null}

			{showSales ? (
				<section className='rounded-lg border border-border bg-surface p-4'>
					<h3 className='mb-3 font-semibold'>Recent sales</h3>
					<SmallListCard items={sales} type='transactions' />
					<div className='mt-3'>
						<Link to='/dashboard/payments' className='text-brand'>
							View all transactions
						</Link>
					</div>
				</section>
			) : null}

			{showPeople ? (
				<div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
					<section className='rounded-lg border border-border bg-surface p-4'>
						<h3 className='mb-3 font-semibold'>Top agents</h3>
						<SmallListCard items={agents} type='agents' />
					</section>
					<section className='rounded-lg border border-border bg-surface p-4'>
						<h3 className='mb-3 font-semibold'>Pending agent approvals</h3>
						<SmallListCard items={pending} type='pendingAgents' />
						<div className='mt-3'>
							<Link to='/dashboard/manage-users' className='text-brand'>
								Review agents
							</Link>
						</div>
					</section>
				</div>
			) : null}

			{showPeople ? (
				<section className='rounded-lg border border-border bg-surface p-4'>
					<h3 className='mb-3 font-semibold'>Recent users</h3>
					<SmallListCard items={users} type='users' />
					<div className='mt-3'>
						<Link to='/dashboard/manage-users' className='text-brand'>
							View all users
						</Link>
					</div>
				</section>
			) : null}

			{showListings ? (
				<section className='rounded-lg border border-border bg-surface p-4'>
					<h3 className='mb-3 font-semibold'>Recent properties</h3>
					<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						{properties.map((property) => (
							<PropertyCard property={property} key={property._id} />
						))}
						<div>
							<ViewAllCard
								to='/dashboard/manage-properties'
								count={totals.properties}
								label='View all properties'
								showCount={properties.length}
							/>
						</div>
					</div>
				</section>
			) : null}
		</div>
	);
}
