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
import { BadgeCheck, Ban, CircleCheck, Clock, MapPin, User, X } from 'lucide-react';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import {
	FilterSection,
	ResultSummary,
	ShowMore,
	usePreview,
} from '@/pages/Dashboard/Components/DashboardFilter';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '../../../components/ui/tooltip';

const STATUS_LABEL = {
	all: 'All properties',
	pending: 'Pending review',
	verified: 'Verified',
	rejected: 'Rejected',
};

export default function AdminManageProperties() {
	const axiosSecure = useAxiosSecure();
	const { filter, choose, visible, showMore } = usePreview('all');

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

	const filtered =
		filter === 'all'
			? properties
			: properties.filter((prop) => prop.verificationStatus === filter);
	const rows = filtered.slice(0, visible);

	const statusBadge = (status) => {
		if (status === 'verified') {
			return (
				<Badge variant='outline' className='gap-1 border-success text-success'>
					<BadgeCheck className='size-4' aria-hidden='true' /> Verified
				</Badge>
			);
		}
		if (status === 'rejected') {
			return (
				<Badge variant='outline' className='gap-1 border-danger text-danger'>
					<X className='size-4' aria-hidden='true' /> Rejected
				</Badge>
			);
		}
		return (
			<Badge variant='outline' className='gap-1 border-warning text-warning'>
				<Clock className='size-4' aria-hidden='true' /> Pending
			</Badge>
		);
	};

	const actions = (prop) =>
		prop.verificationStatus === 'pending' ? (
			<div className='flex flex-wrap gap-2'>
				<Button
					size='sm'
					variant='accent'
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
			<div className='flex items-center gap-2 text-sm font-medium'>
				{prop.verificationStatus === 'verified' ? (
					<span className='flex items-center gap-1 text-success'>
						<CircleCheck className='size-4' aria-hidden='true' /> Done
					</span>
				) : (
					<span className='flex items-center gap-1 text-danger'>
						<Ban className='size-4' aria-hidden='true' /> Done
					</span>
				)}
			</div>
		);

	return (
		<div className='w-full space-y-6'>
			<FilterSection
				label='Status'
				value={filter}
				onChange={choose}
				options={[
					{ value: 'all', label: 'All' },
					{ value: 'pending', label: 'Pending' },
					{ value: 'verified', label: 'Verified' },
					{ value: 'rejected', label: 'Rejected' },
				]}
			/>
			<ResultSummary label={STATUS_LABEL[filter]} value={filtered.length} />
			{rows.length === 0 ? (
				<p className='text-base text-muted-foreground'>
					No properties in this status.
				</p>
			) : (
			<div className='space-y-6'>
			<div className='space-y-3 md:hidden'>
				{rows.map((prop) => (
					<article
						key={prop._id}
						className='space-y-3 rounded-lg border border-border bg-surface p-4'
					>
						<div className='flex gap-3'>
							<img
								src={prop.images?.[0]?.url}
								alt={prop.title}
								className='h-16 w-20 rounded-md object-cover'
							/>
							<div className='min-w-0'>
								<p className='truncate font-medium'>{prop.title}</p>
								<p className='flex items-center gap-1 text-sm text-muted-foreground'>
									<MapPin className='size-4 shrink-0' aria-hidden='true' />
									{prop.location}
								</p>
								<p className='text-sm tabular-nums'>
									৳{parseInt(prop.minPrice).toLocaleString()} – ৳
									{parseInt(prop.maxPrice).toLocaleString()}
								</p>
							</div>
						</div>
						<p className='flex items-center gap-2 text-sm'>
							<User className='size-4 text-muted-foreground' aria-hidden='true' />
							{prop.agentName}
						</p>
						<div className='flex flex-wrap items-center justify-between gap-2'>
							{statusBadge(prop.verificationStatus)}
							{actions(prop)}
						</div>
					</article>
				))}
			</div>
			<div className='hidden md:block'>
			<Table className='w-full'>
				<TableHeader>
					<TableRow className='bg-muted dark:bg-muted hover:bg-muted'>
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
					{rows.map((prop, idx) => (
						<TableRow
							key={prop._id}
							className={`${
								idx % 2 === 0
									? 'bg-surface dark:bg-background'
									: 'bg-muted dark:bg-muted'
							} rounded-md shadow-sm transition-colors duration-200
              hover:bg-muted dark:hover:bg-muted`}
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
							<TableCell className='text-muted-foreground'>
								<span className='flex items-center gap-1'>
									<MapPin className='size-4' aria-hidden='true' />
									{prop.location}
								</span>
							</TableCell>
							<TableCell className='tabular-nums text-foreground'>
								৳{parseInt(prop.minPrice).toLocaleString()} – ৳
								{parseInt(prop.maxPrice).toLocaleString()}
							</TableCell>

							{/* TODO : IN FUTURE we will be adding more tooltip here like how many propeties that user added and aslo how many properties are verified or rejected and also after clicking  and we will be adding a link to visit that user profile only admin can visit that page 
							 =>lazy-fetch that info only on hover for better perf */}

							<TableCell className='text-foreground'>
								<div className='flex items-center gap-2'>
									<User className='size-4' aria-hidden='true' />
									<div className='leading-tight'>
										<p>{prop.agentName}</p>
										<p className='text-sm text-muted-foreground'>
											{prop.agentEmail}
										</p>
									</div>
								</div>
							</TableCell>
							<TableCell className='text-foreground'>
								{prop.propertyType}
							</TableCell>
							<TableCell>{statusBadge(prop.verificationStatus)}</TableCell>
							<TableCell>{actions(prop)}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			</div>
			<ShowMore shown={rows.length} total={filtered.length} onMore={showMore} />
			</div>
			)}
		</div>
	);
}
