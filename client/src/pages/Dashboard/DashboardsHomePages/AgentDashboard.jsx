import { useEffect, useState } from 'react';
import axios from 'axios';
import GlobalLoading from '../../../components/Shared/GlobalLoading';

const AgentDashboard = () => {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		axios
			.get('/api/v1/dashboard/user', { withCredentials: true })
			.then((res) => {
				setData(res.data);
			})
			.catch((err) => {
				console.error('Failed to fetch dashboard data', err);
			})
			.finally(() => setLoading(false));
	}, []);

	if (loading) return <GlobalLoading />;

	return (
		<div className='space-y-6'>
			{/* User Info */}
			<div className='bg-white shadow rounded-lg p-4 flex items-center gap-4'>
				<img
					src={data.user.avatar || '/default-avatar.png'}
					alt='avatar'
					className='w-16 h-16 rounded-full object-cover'
				/>
				<div>
					<h2 className='text-xl font-semibold'>{data.user.name}</h2>
					<p className='text-gray-500'>Role: {data.user.role}</p>
				</div>
			</div>

			{/* Stats */}
			<div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
				<StatBox title='Total Views' value={data.stats.totalViewed} />
				<StatBox title='Offers Made' value={data.stats.offersMade} />
				<StatBox title='Offers Accepted' value={data.stats.offersAccepted} />
			</div>

			{/* Wishlist / Bought / Pending */}
			<div>
				<h3 className='text-lg font-semibold mb-3'>My Properties</h3>
				{data.myProperties?.length > 0 ? (
					<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
						{data.myProperties.map((property) => (
							<PropertyCard key={property._id} property={property} />
						))}
					</div>
				) : (
					<p className='text-gray-500'>You don’t have any properties yet.</p>
				)}
			</div>

			{/* Recommended */}
			<div>
				<h3 className='text-lg font-semibold mb-3'>Recommended for You</h3>
				{data.recommended?.length > 0 ? (
					<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
						{data.recommended.map((property) => (
							<PropertyCard key={property._id} property={property} />
						))}
					</div>
				) : (
					<p className='text-gray-500'>No recommendations right now.</p>
				)}
			</div>
		</div>
	);
};

const StatBox = ({ title, value }) => (
	<div className='bg-white shadow rounded-lg p-4 text-center'>
		<p className='text-sm text-gray-500'>{title}</p>
		<p className='text-2xl font-bold'>{value}</p>
	</div>
);

export default AgentDashboard;
