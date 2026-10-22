import { useState } from 'react';
import DashboardSkeleton from '@/components/Shared/skeletons/DashboardSkeleton';
import PersonAvatar from '@/components/Shared/PersonAvatar';
import { gateQuery } from '@/lib/queryWait';
import useUserDashboard from '@/hooks/useUserDashboard';
import { Clock, Heart, ShoppingBag, Wallet } from 'lucide-react';
import { Link } from 'react-router';
import BoughtPropertyCard from '../Components/BoughtPropertyCard';
import ListingStrip from '../Components/ListingStrip';
import PendingPropertyCard from '../Components/PendingPropertyCard';
import MonthlyBarChart from '../Components/MonthlyBarChart';
import ChartFallback from '../Components/ChartFallback';
import {
	FilterSection,
	ShowMore,
	PREVIEW_LIMIT,
} from '@/pages/Dashboard/Components/DashboardFilter';

const UserDashboard = () => {
	const dashboardQuery = useUserDashboard();
	const { dashboard } = dashboardQuery;
	const [focus, setFocus] = useState('all');
	const gate = gateQuery({ ...dashboardQuery, data: dashboard });

	if (gate === 'loading') return <DashboardSkeleton />;
	if (gate === 'error') return <p>Could not load your dashboard.</p>;

	const activity =
		focus === 'bought'
			? [{ label: 'Bought', value: dashboard.stats.boughtCount }]
			: focus === 'wishlist'
				? [{ label: 'Wishlist', value: dashboard.stats.wishlistCount }]
				: focus === 'offers'
					? [{ label: 'Offers', value: dashboard.stats.pendingOffers }]
					: [
							{ label: 'Bought', value: dashboard.stats.boughtCount },
							{ label: 'Wishlist', value: dashboard.stats.wishlistCount },
							{ label: 'Offers', value: dashboard.stats.pendingOffers },
						];

	return (
		<div className='min-w-0 space-y-8'>
			<div className='flex flex-col items-center gap-4 rounded-lg border border-border bg-surface p-6 sm:flex-row'>
				<PersonAvatar
					name={dashboard.user.name}
					src={dashboard.user.avatar}
					className='size-16'
				/>
				<div className='text-center sm:text-left'>
					<h2 className='font-display text-3xl text-foreground'>
						Welcome, {dashboard.user.name}
					</h2>
					<p className='mt-1 text-base capitalize text-muted-foreground'>
						{dashboard.user.role}
					</p>
				</div>
			</div>

			<FilterSection
				label='Show'
				value={focus}
				onChange={setFocus}
				options={[
					{ value: 'all', label: 'All' },
					{ value: 'bought', label: 'Bought' },
					{ value: 'wishlist', label: 'Wishlist' },
					{ value: 'offers', label: 'Offers' },
				]}
			/>

			<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
				{(focus === 'all' || focus === 'bought') && (
					<StatBox
						title='Bought'
						value={dashboard.stats.boughtCount}
						icon={ShoppingBag}
					/>
				)}
				{(focus === 'all' || focus === 'wishlist') && (
					<StatBox
						title='Wishlist'
						value={dashboard.stats.wishlistCount}
						icon={Heart}
					/>
				)}
				{(focus === 'all' || focus === 'offers') && (
					<StatBox
						title='Pending Offers'
						value={dashboard.stats.pendingOffers}
						icon={Clock}
					/>
				)}
				{focus === 'all' || focus === 'bought' ? (
					<StatBox
						title='Total Spent'
						value={`৳${dashboard.stats.totalSpent.toLocaleString()}`}
						icon={Wallet}
					/>
				) : null}
			</div>

			<section className='rounded-lg border border-border bg-surface p-4'>
				<h3 className='mb-3 text-xl font-semibold'>Your activity</h3>
				<div className='h-56'>
					{activity.some((item) => Number(item.value) > 0) ? (
						<MonthlyBarChart money={false} data={activity} />
					) : (
						<ChartFallback
							title='No activity yet'
							message='Bought homes, wishlist saves, and offers will show up here.'
						/>
					)}
				</div>
			</section>

			{(focus === 'all' || focus === 'bought') && (
				<Section
					title='Bought properties'
					properties={dashboard.boughtProperties}
					CardComponent={BoughtPropertyCard}
					to='/dashboard/property-bought'
				/>
			)}

			{(focus === 'all' || focus === 'wishlist') && (
				<Section
					title='Wishlist'
					properties={dashboard.wishlistProperties}
					CardComponent={ListingStrip}
					to='/dashboard/wishlist'
				/>
			)}

			{(focus === 'all' || focus === 'offers') && (
				<Section
					title='Pending properties'
					properties={dashboard.pendingOffers}
					CardComponent={PendingPropertyCard}
				/>
			)}
		</div>
	);
};

const StatBox = ({ title, value, icon: Icon }) => (
	<div className='rounded-lg border border-border bg-surface p-4 transition-colors duration-200 hover:border-brand'>
		<div className='flex items-center gap-2 text-sm text-muted-foreground'>
			{Icon ? <Icon className='size-4 text-brand' aria-hidden='true' /> : null}
			{title}
		</div>
		<p className='mt-2 text-2xl font-semibold tabular-nums text-foreground'>
			{value}
		</p>
	</div>
);

const Section = ({ title, properties = [], CardComponent = ListingStrip, to }) => {
	const [visible, setVisible] = useState(PREVIEW_LIMIT);
	const shown = properties.slice(0, visible);

	return (
		<section className='rounded-lg border border-border bg-surface p-4'>
			<h3 className='mb-3 text-xl font-semibold'>{title}</h3>
			{shown.length > 0 ? (
				<div className='space-y-4'>
					<div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
						{shown.map((property) => (
							<CardComponent key={property._id} property={property} />
						))}
					</div>
					{to && properties.length > PREVIEW_LIMIT ? (
						<Link to={to} className='text-sm font-medium text-brand hover:underline'>
							View all {properties.length}
						</Link>
					) : (
						<ShowMore
							shown={shown.length}
							total={properties.length}
							onMore={() => setVisible((count) => count + PREVIEW_LIMIT)}
						/>
					)}
				</div>
			) : (
				<p className='py-6 text-base text-muted-foreground'>
					No {title.toLowerCase()} yet.{' '}
					<Link to='/all-properties' className='font-medium text-brand hover:underline'>
						Browse properties
					</Link>
				</p>
			)}
		</section>
	);
};

export default UserDashboard;
