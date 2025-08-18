import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from './useAxiosSecure';
import useAuth from './useAuth';

export default function useAdminDashboard() {
	const axiosSecure = useAxiosSecure();
	const { user, loading } = useAuth();

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ['admin-dashboard', user?.uid || user?.email],
		queryFn: async () => {
			if (!user) return null;
			const res = await axiosSecure.get('/dashboard/admin');
			return res.data;
		},
		enabled: !loading && !!user,
		staleTime: 1000 * 60 * 2,
		retry: 1,
	});

	return { dashboard: data, isLoading, error, refetch };
}
