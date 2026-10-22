import { Link } from 'react-router';
import UserDashboard from './DashboardsHomePages/UserDashboard';
import AgentDashboard from './DashboardsHomePages/AgentDashboard';
import AdminDashboard from './DashboardsHomePages/AdminDashboard';
import GlobalLoading from '@/components/Shared/GlobalLoading';
import { Button } from '@/components/ui/button';
import useUserRole from '@/hooks/useUserRole';

export default function Dashboard() {
	const { role, isLoading, isError, refetch } = useUserRole();

	if (isLoading) return <GlobalLoading />;

	if (role === 'agent') return <AgentDashboard />;
	if (role === 'admin') return <AdminDashboard />;
	if (role === 'user') return <UserDashboard />;

	if (role === 'fraud') {
		return (
			<div className='max-w-xl space-y-4'>
				<h2 className='font-display text-3xl'>This account is suspended</h2>
				<p className='text-base text-muted-foreground'>
					An admin flagged this agent account, so its listings were removed and the
					agent tools are turned off. You can still view your profile. If you think
					this is a mistake, contact support.
				</p>
				<div className='flex flex-wrap gap-3'>
					<Button asChild>
						<Link to='/contact'>Contact support</Link>
					</Button>
					<Button asChild variant='outline'>
						<Link to='/dashboard/profile'>View profile</Link>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className='max-w-xl space-y-4'>
			<h2 className='font-display text-3xl'>Your account details did not load</h2>
			<p className='text-base text-muted-foreground'>
				{isError
					? 'The server did not return your account role. Check your connection and try again.'
					: 'Your account has no role yet. Try again, or contact support if this keeps happening.'}
			</p>
			<div className='flex flex-wrap gap-3'>
				<Button type='button' onClick={() => refetch()}>
					Try again
				</Button>
				<Button asChild variant='outline'>
					<Link to='/contact'>Contact support</Link>
				</Button>
			</div>
		</div>
	);
}
