import { useState } from 'react';
import useAdminDashboard from '@/hooks/useAdminDashboard';
import StatCard from '@/pages/Dashboard/Components/StatCard';
import RevenueChart from '@/pages/Dashboard/Components/RevenueChart';
import SaleAmountChart from '@/pages/Dashboard/Components/SaleAmountChart';
import ChartFallback from '@/pages/Dashboard/Components/ChartFallback';
import SmallListCard from '@/pages/Dashboard/Components/SmallListCard';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import ViewAllCard from '@/pages/Dashboard/Components/ViewAllCard';
import { FilterSection } from '@/pages/Dashboard/Components/DashboardFilter';
import { Link } from 'react-router';
import ListingStrip from '../Components/ListingStrip';
import { Skeleton } from '@/components/ui/skeleton';

const PREVIEW = 6;

export default function AdminDashboard() {
	const { dashboard, isLoading } = useAdminDashboard();
	const [focus, setFocus] = useState('all');

	if (!dashboard && isLoading) return <AdminDashboardSkeleton />;
	if (!dashboard)
		return (
			<div className='p-6 text-destructive'>Failed to load admin dashboard</div>
		);

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
	const sales = (recentTransactions || []).slice(0, PREVIEW);
	const agents = (topAgents || []).slice(0, PREVIEW);
	const pending = (pendingAgentApprovals || []).slice(0, PREVIEW);
	const users = (recentUsers || []).slice(0, PREVIEW);
	const properties = (recentProperties || []).slice(0, PREVIEW);
	const showSales = focus === 'all' || focus === 'sales';
	const showPeople = focus === 'all' || focus === 'people';
	const showListings = focus === 'all' || focus === 'listings';

	return (
		<div className='min-w-0 space-y-6'>
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
				<div className='grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2'>
					<section className='min-w-0 rounded-lg border border-border bg-surface p-4'>
						<h3 className='mb-3 font-semibold'>Latest sale amounts</h3>
						<div className='h-72 min-w-0'>
							{sales.some((sale) => Number(sale.amount) > 0) ? (
								<SaleAmountChart sales={sales} />
							) : (
								<ChartFallback
									title='No sale amounts yet'
									message='This chart fills in once a purchase has a price.'
								/>
							)}
						</div>
					</section>
					<section className='min-w-0 rounded-lg border border-border bg-surface p-4'>
						<h3 className='mb-3 font-semibold'>Monthly revenue</h3>
						{monthlyTotal > 0 ? (
							<div className='h-72 min-w-0'>
								<RevenueChart data={revenueSparkline} />
							</div>
						) : (
							<ChartFallback
								title='No dated sales'
								message='None of the last 6 months has a sale with a payment date, so there is no monthly trend to draw.'
							/>
						)}
					</section>
				</div>
			) : null}

			{showSales ? (
				<section className='rounded-lg border border-border bg-surface p-4'>
					<h3 className='mb-3 font-semibold'>Recent sales</h3>
					{sales.length === 0 ? (
						<p className='text-sm text-muted-foreground'>No sales yet.</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow className='bg-muted hover:bg-muted'>
									<TableHead>Property</TableHead>
									<TableHead>Buyer</TableHead>
									<TableHead className='text-right'>Amount</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{sales.map((sale, index) => (
									<TableRow
										key={sale._id || sale.transactionId || index}
										className={
											index % 2 === 0
												? 'bg-surface hover:bg-muted'
												: 'bg-muted hover:bg-muted'
										}
									>
										<TableCell className='max-w-xs font-medium'>
											<Link
												to={`/all-properties/${sale.propertyId}`}
												className='block truncate hover:text-brand hover:underline'
											>
												{sale.propertyTitle || 'Property'}
											</Link>
										</TableCell>
										<TableCell className='text-muted-foreground'>
											{sale.buyerName || 'Buyer'}
										</TableCell>
										<TableCell className='text-right font-semibold tabular-nums'>
											৳{Number(sale.amount || 0).toLocaleString()}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
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
					{users.length === 0 ? (
						<p className='text-sm text-muted-foreground'>No users yet.</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow className='bg-muted hover:bg-muted'>
									<TableHead>Name</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Role</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{users.map((person, index) => (
									<TableRow
										key={person._id || person.uid || index}
										className={
											index % 2 === 0
												? 'bg-surface hover:bg-muted'
												: 'bg-muted hover:bg-muted'
										}
									>
										<TableCell className='font-medium'>
											{person.name || 'User'}
										</TableCell>
										<TableCell className='text-muted-foreground'>
											{person.email}
										</TableCell>
										<TableCell className='capitalize'>
											{person.role || 'user'}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
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
					<div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
						{properties.map((property) => (
							<ListingStrip
								key={property._id}
								property={property}
								status={property.verificationStatus}
								statusClassName={
									property.verificationStatus === 'verified'
										? 'text-brand'
										: property.verificationStatus === 'rejected'
											? 'text-destructive'
											: 'text-warning'
								}
							/>
						))}
					</div>
					<ViewAllCard
						to='/dashboard/manage-properties'
						count={totals.properties}
						label='View all properties'
						showCount={properties.length}
					/>
				</section>
			) : null}
		</div>
	);
}

function AdminDashboardSkeleton() {
	return (
		<div className='space-y-6' aria-busy='true'>
			<span className='sr-only'>Loading dashboard</span>
			<Skeleton className='h-20 w-full' />
			<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
				{Array.from({ length: 6 }, (_, index) => (
					<Skeleton key={index} className='h-24' />
				))}
			</div>
			<Skeleton className='h-72 w-full' />
			<Skeleton className='h-48 w-full' />
		</div>
	);
}
