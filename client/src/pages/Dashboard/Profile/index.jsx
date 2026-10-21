import { useEffect } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import {
	Clock,
	Droplet,
	House,
	Info,
	MapPin,
	Pencil,
	Phone,
	User,
	UserCheck,
	KeyRound,
} from 'lucide-react';

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import useUserProfile from '@/hooks/useUserProfile';
import useAuth from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { gateQuery } from '@/lib/queryWait';

export default function ProfilePage() {
	const { user } = useAuth();
	const profileQuery = useUserProfile();
	const { data: profile } = profileQuery;
	const gate = gateQuery(profileQuery);

	console.log(user);

	useEffect(() => {
		document.title = user
			? `${user.displayName || 'Profile'} | Home Horizon`
			: 'Profile | Home Horizon';
	}, [user]);

	if (gate === 'error') {
		return (
			<div className='space-y-3'>
				<p className='text-destructive'>Could not load your profile.</p>
				<Button type='button' variant='outline' onClick={() => profileQuery.refetch()}>
					Try again
				</Button>
			</div>
		);
	}

	if (gate === 'loading') {
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
			icon: <Clock className='size-4' aria-hidden='true' />,
			label: 'Joined',
			value: moment(created_at).format('LL'),
		},
		{
			icon: <UserCheck className='size-4' aria-hidden='true' />,
			label: 'Last Login',
			value: moment(last_log_in).format('LLL'),
		},
		{
			icon: <Info className='size-4' aria-hidden='true' />,
			label: 'Status',
			value: status || 'Not set',
		},
		{
			icon: <KeyRound className='size-4' aria-hidden='true' />,
			label: 'Login Method',
			value: loginMethod,
		},
	];

	const userInfo = [
		{
			icon: <MapPin className='size-4' aria-hidden='true' />,
			label: 'Location',
			value: location,
		},
		{
			icon: <House className='size-4' aria-hidden='true' />,
			label: 'Address',
			value: address,
		},
		{
			icon: <Phone className='size-4' aria-hidden='true' />,
			label: 'Phone',
			value: phoneNumber,
		},
		{
			icon: <User className='size-4' aria-hidden='true' />,
			label: 'Gender',
			value: gender,
		},
		{
			icon: <Clock className='size-4' aria-hidden='true' />,
			label: 'Age',
			value: age,
		},
		{
			icon: <Droplet className='size-4' aria-hidden='true' />,
			label: 'Blood Group',
			value: bloodGroup,
		},
	];

	return (
		<>
			<div className='w-full'>
				<Card className='w-full border border-border bg-surface p-6 shadow-none'>
					<CardHeader className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
						<div className='flex items-center gap-4'>
							<img
								src={profilePic || '/user.png'}
								alt=''
								className='size-16 rounded-full object-cover'
							/>
							<div>
								<h2 className='font-display text-3xl'>{name}</h2>
								<p className='text-base text-muted-foreground'>{email}</p>
								{role === 'admin' && (
									<p className='text-sm capitalize text-brand'>Admin</p>
								)}
								{role === 'agent' && (
									<p className='text-sm capitalize text-brand'>Agent</p>
								)}
							</div>
						</div>
						<Button asChild variant='outline'>
							<Link to='/dashboard/profile/edit'>
								<Pencil aria-hidden='true' /> Edit
							</Link>
						</Button>
					</CardHeader>

					<CardContent className='mt-4 grid max-w-4xl grid-cols-1 gap-3 px-0 md:grid-cols-2 md:px-6'>
						{firebaseInfo.concat(userInfo).map((item, idx) => (
							<div key={idx} className='flex items-center gap-2 text-base'>
								<span className='text-brand'>{item.icon}</span>
								<span className='font-medium'>{item.label}:</span>
								<span>{item.value || 'Not set'}</span>
							</div>
						))}
					</CardContent>
				</Card>
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
