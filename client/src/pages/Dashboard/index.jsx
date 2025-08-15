import UserDashboard from './DashboardsHomePages/UserDashboard';
import AgentDashboard from './DashboardsHomePages/AgentDashboard';
import AdminDashboard from './DashboardsHomePages/AdminDashboard';
import GlobalLoading from '@/components/Shared/GlobalLoading';
import useUserRole from '@/hooks/useUserRole';

export default function Dashboard() {
	const { role, isLoading } = useUserRole();

	if (isLoading) return <GlobalLoading />;

	if (role === 'agent') return <AgentDashboard />;
	if (role === 'admin') return <AdminDashboard />;
	return <UserDashboard />;
}
