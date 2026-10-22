import { keepPreviousData, useQuery } from '@tanstack/react-query';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import useAuth from '@/hooks/useAuth';
import { listParams } from '@/lib/pageList';

export default function useMyProperties({ page = 1, filter = 'all', query = '' } = {}) {
	const { user } = useAuth();
	const axiosSecure = useAxiosSecure();

	return useQuery({
		queryKey: ['my-properties', user?.uid, page, filter, query],
		enabled: !!user?.uid,
		placeholderData: keepPreviousData,
		queryFn: async () => {
			const res = await axiosSecure.get('/agent/my-properties', {
				params: listParams({ page, filter, query }),
			});
			return res.data;
		},
	});
}
