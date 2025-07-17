import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import useAuth from '@/hooks/useAuth';

export default function AgentOffersPage() {
	const { user } = useAuth();
	const axios = useAxiosSecure();
	const queryClient = useQueryClient();

	const { data: offers = [], isLoading } = useQuery({
		queryKey: ['agent-offers', user?.uid],
		enabled: !!user?.uid,
		queryFn: async () => {
			const res = await axios.get(`/agent/offers?uid=${user.uid}`);
			return res.data;
		},
	});

	const mutation = useMutation({
		mutationFn: ({ offerId, newStatus, propertyId }) =>
			axios.patch(`/agent/offers/${offerId}/status`, {
				status: newStatus,
				propertyId,
			}),
		onSuccess: () => {
			toast.success('Offer status updated');
			queryClient.invalidateQueries(['agent-offers']);
		},
		onError: (err) =>
			toast.error(err.response.data.error || 'Something went wrong'),
	});

	if (isLoading)
		return (
			<div className='p-4 space-y-2 max-w-full w-full mt-10'>
				{[...Array(4)].map((_, i) => (
					<Skeleton key={i} className='h-10 rounded-md w-full' />
				))}
				<Table className='!w-full !max-w-full'>
					<TableBody>
						<TableRow className='bg-gray-100'>
							{[...Array(6)].map((_, i) => (
								<TableCell key={i}>
									<Skeleton className='h-4 w-32' />
								</TableCell>
							))}
						</TableRow>
					</TableBody>
				</Table>
			</div>
		);

	const renderStatus = (status) => {
		if (status === 'pending') return <Badge variant='outline'>Pending</Badge>;
		if (status === 'accepted')
			return <Badge className='bg-green-100 text-green-600'>Accepted</Badge>;
		if (status === 'rejected')
			return <Badge className='bg-red-100 text-red-600'>Rejected</Badge>;
		return null;
	};

	return (
		<div className='overflow-x-auto bg-background p-6 rounded-md shadow-md w-full'>
			<h2 className='text-2xl font-semibold mb-4'>
				Requested / Offered Properties
			</h2>
			<Table className='!w-full !max-w-full'>
				<TableHeader>
					<TableRow className='bg-gray-100 hover:bg-slate-200'>
						<TableHead>Image</TableHead>
						<TableHead>Title</TableHead>
						<TableHead>Location</TableHead>
						<TableHead>Buyer Name</TableHead>
						<TableHead>Buyer Email</TableHead>
						<TableHead>Offer (৳)</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Action</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{offers.map((offer) => (
						<TableRow
							key={offer._id}
							className='even:bg-gray-50 hover:bg-slate-200 transition'
						>
							<TableCell>
								<img
									src={offer.propertyImage}
									alt={offer.propertyTitle}
									className='w-16 h-12 rounded-md object-cover border border-gray-300 dark:border-gray-700'
								/>
							</TableCell>
							<TableCell>{offer.propertyTitle}</TableCell>
							<TableCell>{offer.propertyLocation}</TableCell>
							<TableCell>{offer.buyerName}</TableCell>
							<TableCell>{offer.buyerEmail}</TableCell>
							<TableCell>৳{offer.offerAmount}</TableCell>
							<TableCell>{renderStatus(offer.status)}</TableCell>
							<TableCell className='flex flex-wrap gap-2'>
								{offer.status === 'pending' ? (
									<>
										<Button
											size='sm'
											onClick={() =>
												mutation.mutate({
													offerId: offer._id,
													newStatus: 'accepted',
													propertyId: offer?.propertyId,
												})
											}
											disabled={mutation.isPending}
										>
											Accept
										</Button>
										<Button
											size='sm'
											variant='destructive'
											onClick={() =>
												mutation.mutate({
													offerId: offer._id,
													newStatus: 'rejected',
													propertyId: offer?.propertyId,
												})
											}
											disabled={mutation.isPending}
										>
											Reject
										</Button>
									</>
								) : (
									<span className='text-sm text-muted-foreground'>
										No action
									</span>
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
