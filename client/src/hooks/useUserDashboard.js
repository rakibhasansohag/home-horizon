import { keepPreviousData, useQuery } from '@tanstack/react-query';
import useAuth from './useAuth';
import useAxiosSecure from './useAxiosSecure';

export default function useUserDashboard() {
	const { user, loading } = useAuth();
	const axiosSecure = useAxiosSecure();

	const query = useQuery({
		queryKey: ['user-dashboard', user?.uid || user?.email],
		queryFn: async () => {
			if (!user?.uid && !user?.email) return null;
			const res = await axiosSecure.get('/dashboard/user');
			return res.data;
		},
		enabled: !loading && !!user,
		placeholderData: keepPreviousData,
		staleTime: 1000 * 60 * 2,
		retry: 1,
	});

	return { dashboard: query.data, ...query };
}
