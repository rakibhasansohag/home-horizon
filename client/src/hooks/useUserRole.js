import { useQuery } from '@tanstack/react-query';
import useAuth from './useAuth';
import useAxiosSecure from './useAxiosSecure';

export default function useUserRole() {
	const { user, loading } = useAuth();
	const axiosSecure = useAxiosSecure();

	const { data, isLoading, error } = useQuery({
		queryKey: ['user-role', user?.email || user?.uid],
		queryFn: async () => {
			if (!user?.email && !user?.uid) return null;
			const res = await axiosSecure.get(`/users/role`, {
				params: {
					email: user?.email,
					uid: user?.uid,
				},
			});
			return res.data?.role;
		},
		enabled: !loading && !!user,
	});

	return { role: data, isLoading, error };
}
