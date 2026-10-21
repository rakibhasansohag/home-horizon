import PropertyCard from '../Components/PropertyCard';
import GlobalLoading from '@/components/Shared/GlobalLoading';
import useUserDashboard from '@/hooks/useUserDashboard';
import { Clock, Heart, ShoppingBag, Wallet } from 'lucide-react';
import { Link } from 'react-router';
import BoughtPropertyCard from '../Components/BoughtPropertyCard';
import PendingPropertyCard from '../Components/PendingPropertyCard';

const UserDashboard = () => {
	const { dashboard, isLoading, error } = useUserDashboard();

	if (isLoading) return <GlobalLoading />;
	if (error) return <p>Error: {error.message}</p>;

	return (
		<div className='space-y-8'>
			<div className='flex flex-col items-center gap-4 rounded-lg border border-border bg-surface p-6 sm:flex-row'>
				<img
					src={dashboard.user.avatar || '/default-avatar.png'}
					alt=''
					className='size-16 rounded-full object-cover'
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

			{/* Stats */}
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
				<StatBox
					title='Bought'
					value={dashboard.stats.boughtCount}
					icon={ShoppingBag}
				/>
				<StatBox
					title='Wishlist'
					value={dashboard.stats.wishlistCount}
					icon={Heart}
				/>
				<StatBox
					title='Pending Offers'
					value={dashboard.stats.pendingOffers}
					icon={Clock}
				/>
				<StatBox
					title='Total Spent'
					value={`৳${dashboard.stats.totalSpent.toLocaleString()}`}
					icon={Wallet}
				/>
			</div>

			{/* Bought Properties */}
			<Section
				title='Bought Properties'
				properties={dashboard.boughtProperties}
				CardComponent={BoughtPropertyCard}
			/>

			{/* Wishlist */}
			<Section title='Wishlist' properties={dashboard.wishlistProperties} />

			{/* Pending Offers */}
			<Section
				title='Pending Properties'
				properties={dashboard.pendingOffers}
				CardComponent={PendingPropertyCard}
			/>
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

// eslint-disable-next-line no-unused-vars
const Section = ({ title, properties, CardComponent = PropertyCard }) => (
	<div>
		<h3 className='mb-3 text-xl font-semibold'>{title}</h3>
		{properties?.length > 0 ? (
			<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
				{properties?.map((property) => (
					<CardComponent key={property._id} property={property} />
				))}
			</div>
		) : (
			<p className='py-6 text-base text-muted-foreground'>
				No {title.toLowerCase()} yet.{' '}
				<Link to='/all-properties' className='font-medium text-brand hover:underline'>
					Browse properties
				</Link>
			</p>
		)}
	</div>
);

export default UserDashboard;
