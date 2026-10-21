import { keepPreviousData, useQuery } from '@tanstack/react-query';
import useAuth from '@/hooks/useAuth';
import useAxiosSecure from '@/hooks/useAxiosSecure';

export default function useUserProfile() {
	const { user, loading } = useAuth();
	const axiosSecure = useAxiosSecure();
	const uid = user?.uid;

	return useQuery({
		enabled: !loading && !!uid,
		queryKey: ['user-profile', uid],
		placeholderData: keepPreviousData,
		staleTime: 60 * 1000,
		queryFn: async () => {
			const res = await axiosSecure.get(`/users/${uid}`);
			return res.data;
		},
	});
}
