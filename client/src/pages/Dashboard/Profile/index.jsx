import { useEffect } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';

import {
	FaEdit,
	FaMapMarkerAlt,
	FaPhone,
	FaHome,
	FaVenusMars,
	FaClock,
	FaUserCheck,
	FaInfoCircle,
	FaUserTie,
} from 'react-icons/fa';
import { MdBloodtype } from 'react-icons/md';

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import useUserProfile from '@/hooks/useUserProfile';
import useAuth from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
	const { user } = useAuth();
	const { data: profile, isLoading } = useUserProfile();

	console.log(user);

	useEffect(() => {
		document.title = user
			? `${user.displayName || 'Profile'} | Home Horizon`
			: 'Profile | Home Horizon';
	}, [user]);

	if (isLoading) {
		return (
			<Card className='w-full mx-auto mt-10 p-6'>
				<CardHeader className='flex items-center gap-4'>
					<Skeleton className='w-20 h-20 rounded-full' />
					<div className='space-y-2'>
						<Skeleton className='w-40 h-4' />
						<Skeleton className='w-64 h-3' />
					</div>
				</CardHeader>
				<CardContent className='space-y-2'>
					<Skeleton className='h-3 w-full' />
					<Skeleton className='h-3 w-3/4' />
					<Skeleton className='h-3 w-1/2' />
				</CardContent>
			</Card>
		);
	}

	const {
		name,
		email,
		profilePic,
		role,
		location,
		phoneNumber,
		bloodGroup,
		age,
		gender,
		address,
		created_at,
		last_log_in,
		status,
		loginMethod,
		propertiesBrought,
	} = profile || {};

	const firebaseInfo = [
		{
			icon: <FaClock />,
			label: 'Joined',
			value: moment(created_at).format('LL'),
		},
		{
			icon: <FaUserCheck />,
			label: 'Last Login',
			value: moment(last_log_in).format('LLL'),
		},
		{
			icon: <FaInfoCircle />,
			label: 'Status',
			value: status || 'Not set',
		},
		{
			icon: <FaUserTie />,
			label: 'Login Method',
			value: loginMethod,
		},
	];

	const userInfo = [
		{ icon: <FaMapMarkerAlt />, label: 'Location', value: location },
		{ icon: <FaHome />, label: 'Address', value: address },
		{ icon: <FaPhone />, label: 'Phone', value: phoneNumber },
		{ icon: <FaVenusMars />, label: 'Gender', value: gender },
		{ icon: <FaClock />, label: 'Age', value: age },
		{ icon: <MdBloodtype />, label: 'Blood Group', value: bloodGroup },
	];

	return (
		<>
			<div className='grid grid-cols-1 gap-6 justify-between w-full lg:pr-12'>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
				>
					<Card className='w-full mx-auto mt-10 p-6 shadow-md'>
						<CardHeader className='flex flex-col sm:flex-row items-center justify-between gap-4'>
							<div className='flex items-center gap-4'>
								<img
									src={profilePic || '/user.png'}
									alt='Profile'
									className='w-20 h-20 object-cover rounded-full border'
								/>
								<div>
									<h2 className='text-xl font-semibold'>{name}</h2>
									<p className='text-muted-foreground text-sm'>{email}</p>
									{role === 'admin' && (
										<p className='text-muted-foreground text-sm'>Admin</p>
									)}
									{role === 'agent' && (
										<p className='text-muted-foreground text-sm'>Agent</p>
									)}
								</div>
							</div>
							<Button asChild>
								<Link to='/dashboard/profile/edit'>
									<FaEdit className='mr-2' /> Edit
								</Link>
							</Button>
						</CardHeader>

						<CardContent className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 max-w-4xl px-0 md:px-6'>
							{firebaseInfo.concat(userInfo).map((item, idx) => (
								<div key={idx} className='flex items-center gap-2 text-sm'>
									<span className='text-primary'>{item.icon}</span>
									<span className='font-medium'>{item.label}:</span>
									<span>{item.value || 'Not set'}</span>
								</div>
							))}
						</CardContent>
					</Card>
				</motion.div>
			</div>
			{propertiesBrought && (
				<div className='mt-4'>
					<h3 className='text-lg font-semibold mb-2'>Properties Bought</h3>
					<ul className='list-disc list-inside text-sm text-muted-foreground'>
						{propertiesBrought.map((p, i) => (
							<li key={i}>{p}</li>
						))}
					</ul>
				</div>
			)}
		</>
	);
}
