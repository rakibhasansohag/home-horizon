import { useQuery } from '@tanstack/react-query';
import useAuth from '@/hooks/useAuth';
import useAxiosSecure from '@/hooks/useAxiosSecure';

export default function useUserProfile() {
	const { user } = useAuth();
	const axiosSecure = useAxiosSecure();

	const uid = user?.uid;

	return useQuery({
		enabled: !!uid,
		queryKey: ['user-profile', uid],

		queryFn: async () => {
			const res = await axiosSecure.get(`/users/${uid}`);
			return res.data;
		},
	});
}
