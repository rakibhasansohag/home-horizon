import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MdVerified, MdClose, MdHourglassEmpty } from 'react-icons/md';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { AiOutlineUser } from 'react-icons/ai';
import { AiOutlineCheckCircle, AiOutlineStop } from 'react-icons/ai';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '../../../components/ui/tooltip';

export default function AdminManageProperties() {
	const axiosSecure = useAxiosSecure();

	const {
		data: properties = [],
		refetch,
		isLoading,
	} = useQuery({
		queryKey: ['admin-properties'],
		queryFn: async () => {
			const res = await axiosSecure.get('/admin/properties');
			return res.data;
		},
	});

	const verifyMutation = useMutation({
		mutationFn: (id) => axiosSecure.patch(`/admin/properties/verify/${id}`),
		onSuccess: () => {
			toast.success('Property verified');
			refetch();
		},
		onError: () => toast.error('Verification failed'),
	});

	const rejectMutation = useMutation({
		mutationFn: (id) => axiosSecure.patch(`/admin/properties/reject/${id}`),
		onSuccess: () => {
			toast.success('Property rejected');
			refetch();
		},
		onError: () => toast.error('Rejection failed'),
	});

	if (isLoading)
		return (
			<div className='p-4 space-y-2 max-w-full'>
				{[...Array(6)].map((_, i) => (
					<Skeleton key={i} className='h-10 rounded-md w-full' />
				))}
			</div>
		);

	return (
		<div className='overflow-x-auto bg-background p-6 space-y-4  w-full '>
			<h2 className='text-2xl font-semibold mb-6 text-foreground'>
				Manage Properties
			</h2>
			<Table className='!w-full !max-w-7xl shadow-md '>
				<TableHeader>
					<TableRow className='bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'>
						<TableHead>Image</TableHead>
						<TableHead>Title</TableHead>
						<TableHead>Location</TableHead>
						<TableHead>Price Range</TableHead>
						<TableHead>Agent</TableHead>
						<TableHead>Type</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{properties.map((prop, idx) => (
						<TableRow
							key={prop._id}
							className={`${
								idx % 2 === 0
									? 'bg-white dark:bg-background'
									: 'bg-gray-50 dark:bg-muted'
							} rounded-md shadow-sm transition-colors duration-200
              hover:bg-slate-200 dark:hover:bg-slate-700`}
						>
							<TableCell>
								<img
									src={prop.images?.[0]?.url}
									alt={prop.title}
									className='w-16 h-12 rounded-md object-cover border border-gray-300 dark:border-gray-700'
								/>
							</TableCell>
							<TableCell className='text-foreground'>
								<Tooltip>
									<TooltipTrigger>{prop.title}</TooltipTrigger>
									<TooltipContent>{`${prop.reviews.length} Review${
										prop.reviews.length > 1 ? 's' : ''
									}`}</TooltipContent>
								</Tooltip>
							</TableCell>
							<TableCell className='flex items-center gap-1 text-muted-foreground'>
								<FaMapMarkerAlt />
								{prop.location}
							</TableCell>
							<TableCell className='text-foreground'>
								{parseInt(prop.minPrice).toLocaleString()} -{' '}
								{parseInt(prop.maxPrice).toLocaleString()} BDT
							</TableCell>

							{/* TODO : IN FUTURE we will be adding more tooltip here like how many propeties that user added and aslo how many properties are verified or rejected and also after clicking  and we will be adding a link to visit that user profile only admin can visit that page 
							 =>lazy-fetch that info only on hover for better perf */}

							<TableCell className='flex items-center gap-2 text-foreground'>
								<AiOutlineUser className='text-lg' />
								<div className='leading-tight'>
									<p>{prop.agentName}</p>
									<p className='text-xs text-muted-foreground'>
										{prop.agentEmail}
									</p>
								</div>
							</TableCell>
							<TableCell className='text-foreground'>
								{prop.propertyType}
							</TableCell>
							<TableCell>
								{prop.verificationStatus === 'verified' ? (
									<Badge
										variant='outline'
										className='flex items-center gap-1 text-green-600 border-green-600'
									>
										<MdVerified /> Verified
									</Badge>
								) : prop.verificationStatus === 'rejected' ? (
									<Badge
										variant='outline'
										className='flex items-center gap-1 text-red-600 border-red-600'
									>
										<MdClose /> Rejected
									</Badge>
								) : (
									<Badge
										variant='outline'
										className='flex items-center gap-1 text-yellow-600 border-yellow-600'
									>
										<MdHourglassEmpty /> Pending
									</Badge>
								)}
							</TableCell>
							<TableCell>
								{prop.verificationStatus === 'pending' ? (
									<div className='flex gap-2'>
										<Button
											size='sm'
											variant='success'
											onClick={() => verifyMutation.mutate(prop._id)}
											disabled={verifyMutation.isLoading}
										>
											{verifyMutation.isLoading ? 'Verifying...' : 'Verify'}
										</Button>
										<Button
											size='sm'
											variant='destructive'
											onClick={() => rejectMutation.mutate(prop._id)}
											disabled={rejectMutation.isLoading}
										>
											{rejectMutation.isLoading ? 'Rejecting...' : 'Reject'}
										</Button>
									</div>
								) : (
									<div className='flex items-center gap-2 text-sm font-semibold'>
										{prop.verificationStatus === 'verified' ? (
											<span className='text-green-600 flex items-center gap-1'>
												<AiOutlineCheckCircle /> Done
											</span>
										) : (
											<span className='text-red-600 flex items-center gap-1'>
												<AiOutlineStop /> Done
											</span>
										)}
									</div>
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
