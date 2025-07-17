import { Navigate, Outlet } from 'react-router';
import useUserRole from '@/hooks/useUserRole';
import GlobalLoading from '../components/Shared/GlobalLoading';

export default function ProtectedDashboardRoute({ allowedRoles = [] }) {
	const { role, isLoading } = useUserRole();
	console.log(role, allowedRoles);
	if (isLoading) return <GlobalLoading />;

	if (!role || !allowedRoles.includes(role)) {
		return <Navigate to='/unauthorized' replace />;
	}

	return <Outlet />;
}
