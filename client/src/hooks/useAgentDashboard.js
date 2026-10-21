import { keepPreviousData, useQuery } from '@tanstack/react-query';
import useAuth from './useAuth';
import useAxiosSecure from './useAxiosSecure';

export default function useAgentDashboard() {
	const { user, loading } = useAuth();
	const axios = useAxiosSecure();

	const query = useQuery({
		queryKey: ['agent-dashboard', user?.uid || user?.email],
		queryFn: async () => {
			if (!user?.uid) return null;
			const res = await axios.get('/dashboard/agent');
			return res.data;
		},
		enabled: !loading && !!user,
		placeholderData: keepPreviousData,
		staleTime: 1000 * 60 * 1,
	});

	return { dashboard: query.data, ...query };
}
