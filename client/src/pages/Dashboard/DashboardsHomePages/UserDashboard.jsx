import PropertyCard from '../Components/PropertyCard';
import GlobalLoading from '@/components/Shared/GlobalLoading';
import useUserDashboard from '@/hooks/useUserDashboard';
import {
	FaShoppingCart,
	FaHeart,
	FaMoneyBillWave,
	FaClock,
} from 'react-icons/fa';
import BoughtPropertyCard from '../Components/BoughtPropertyCard';
import PendingPropertyCard from '../Components/PendingPropertyCard';

const UserDashboard = () => {
	const { dashboard, isLoading, error } = useUserDashboard();

	if (isLoading) return <GlobalLoading />;
	if (error) return <p>Error: {error.message}</p>;

	return (
		<div className='space-y-6 p-6'>
			{/* User Info */}
			<div className='bg-background dark:bg-card shadow-lg rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6 border border-card-foreground/10'>
				<img
					src={dashboard.user.avatar || '/default-avatar.png'}
					alt='avatar'
					className='w-24 h-24 rounded-full object-cover ring-2 ring-primary ring-offset-4 ring-offset-background'
				/>
				<div className='text-center sm:text-left'>
					<h2 className='text-3xl font-bold tracking-tight text-foreground'>
						Welcome, {dashboard.user.name}!
					</h2>
					<p className='text-lg text-muted-foreground mt-1'>
						Role: {dashboard.user.role}
					</p>
				</div>
			</div>

			{/* Stats */}
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
				<StatBox
					title='Bought'
					value={dashboard.stats.boughtCount}
					icon={FaShoppingCart}
				/>
				<StatBox
					title='Wishlist'
					value={dashboard.stats.wishlistCount}
					icon={FaHeart}
				/>
				<StatBox
					title='Pending Offers'
					value={dashboard.stats.pendingOffers}
					icon={FaClock}
				/>
				<StatBox
					title='Total Spent'
					value={`$${dashboard.stats.totalSpent.toLocaleString()}`}
					icon={FaMoneyBillWave}
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
	<div className='relative overflow-hidden bg-card rounded-xl p-6 shadow-md transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl group'>
		{/* Animated Gradient Border */}
		<div className='absolute inset-0 bg-gradient-to-br from-primary via-accent to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>

		<div className='relative z-10'>
			<div className='flex items-center gap-3'>
				{Icon && <Icon className='w-8 h-8 text-primary' />}
				<p className='text-sm text-muted-foreground uppercase tracking-wide font-medium'>
					{title}
				</p>
			</div>
			<p className='text-4xl font-extrabold text-foreground mt-2'>{value}</p>
		</div>
	</div>
);

// eslint-disable-next-line no-unused-vars
const Section = ({ title, properties, CardComponent = PropertyCard }) => (
	<div>
		<h3 className='text-2xl font-bold mb-3 border-b-2 border-primary/20 pb-2'>
			{title}
		</h3>
		{properties?.length > 0 ? (
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
				{properties?.map((property) => (
					<CardComponent key={property._id} property={property} />
				))}
			</div>
		) : (
			<p className='text-muted-foreground text-center py-8'>
				<span className='font-semibold'>No {title.toLowerCase()} yet.</span>{' '}
				Explore listings to get started.
			</p>
		)}
	</div>
);

export default UserDashboard;
