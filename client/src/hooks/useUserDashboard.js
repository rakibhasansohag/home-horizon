import { useQuery } from '@tanstack/react-query';
import useAuth from './useAuth';
import useAxiosSecure from './useAxiosSecure';

export default function useUserDashboard() {
	const { user, loading } = useAuth();
	const axiosSecure = useAxiosSecure();

	const { data, isLoading, error } = useQuery({
		queryKey: ['user-dashboard', user?.uid || user?.email],
		queryFn: async () => {
			// guard: if no user, return null (won't be called if enabled is false)
			if (!user?.uid && !user?.email) return null;
			const res = await axiosSecure.get('/dashboard/user');
			return res.data;
		},
		enabled: !loading && !!user,
		staleTime: 1000 * 60 * 2,
		retry: 1,
	});

	return { dashboard: data, isLoading, error };
}
