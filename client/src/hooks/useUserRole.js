import { useQuery } from '@tanstack/react-query';
import useAuth from './useAuth';
import useAxiosSecure from './useAxiosSecure';

export default function useUserRole() {
	const { user, loading } = useAuth();
	const axiosSecure = useAxiosSecure();

	const { data, isPending, isFetching, isError, error, refetch } = useQuery({
		queryKey: ['user-role', user?.uid || user?.email],
		queryFn: async () => {
			if (!user?.email && !user?.uid) return null;
			const res = await axiosSecure.get(`/users/role`, {
				params: {
					email: user?.email,
					uid: user?.uid,
				},
			});
			return res.data?.role ?? null;
		},
		enabled: !loading && !!user,
		staleTime: 5 * 60 * 1000,
	});

	return {
		role: data,
		isLoading: !data && !isError && (isPending || isFetching),
		isError,
		error,
		refetch,
	};
}
