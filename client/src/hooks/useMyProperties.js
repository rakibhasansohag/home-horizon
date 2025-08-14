import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import useAuth from '@/hooks/useAuth';

export default function useMyProperties() {
	const { user } = useAuth();
	const axiosSecure = useAxiosSecure();

	return useQuery({
		queryKey: ['my-properties', user?.uid],
		enabled: !!user?.uid,
		queryFn: async () => {
			const res = await axiosSecure.get('/agent/my-properties');
			return res.data;
		},
	});
}
