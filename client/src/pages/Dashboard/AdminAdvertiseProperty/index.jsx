import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import ConfirmActionModal from '@/components/shared/ConfirmActionModal';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-toastify';

export default function AdminAdvertiseProperty() {
	const axios = useAxiosSecure();
	const qc = useQueryClient();

	const [selected, setSelected] = useState(null);

	const { data: properties = [], isLoading } = useQuery({
		queryKey: ['admin‐verified-properties'],
		queryFn: () => axios.get('/admin/verified-properties').then((r) => r.data),
	});

	const { data: stats } = useQuery({
		queryKey: ['advertise‐stats'],
		queryFn: () => axios.get('/admin/advertise-stats').then((r) => r.data),
		staleTime: 60 * 1000,
	});

	const advertiseM = useMutation({
		mutationFn: (id) => axios.patch(`/admin/advertise-property/${id}`),
		onSuccess: () => {
			toast.success('Property advertised');
			qc.invalidateQueries({ queryKey: ['admin‐verified-properties'] });
			qc.invalidateQueries({ queryKey: ['advertise-stats'] });
			setSelected(null);
		},
		onError: () => toast.error('Failed to advertise'),
	});

	const unadvertiseM = useMutation({
		mutationFn: (id) => axios.patch(`/admin/unadvertise-property/${id}`),
		onSuccess: () => {
			toast.success('Property un‑advertised');
			qc.invalidateQueries({ queryKey: ['admin‐verified-properties'] });
			qc.invalidateQueries({ queryKey: ['advertise‐stats'] });
			setSelected(null);
		},
		onError: () => toast.error('Failed to un‑advertise'),
	});

	if (isLoading) {
		return (
			<div className='p-4 space-y-2 max-w-full'>
				{Array.from({ length: 6 }).map((_, i) => (
					<Skeleton key={i} className='h-10 w-full rounded-md' />
				))}
			</div>
		);
	}

	return (
		<div className='p-6 space-y-6 bg-background w-full max-w-7xl'>
			<h2 className='text-2xl font-semibold'>Advertise Property</h2>

			{/* stats card */}
			<div className='p-4 bg-white rounded shadow flex items-center justify-between'>
				<div>
					<p className='text-sm text-muted-foreground'>Total Advertised</p>
					<p className='text-3xl font-bold'>{stats?.total ?? 0}</p>
				</div>
			</div>

			<Table className='shadow-md'>
				<TableHeader>
					<TableRow className='bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'>
						<TableHead>Image</TableHead>
						<TableHead>Title</TableHead>
						<TableHead>Price</TableHead>
						<TableHead>Agent</TableHead>
						<TableHead>Action</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{properties.map((p, i) => (
						<TableRow
							key={p._id}
							className={`${
								i % 2 === 0
									? 'bg-white dark:bg-background'
									: 'bg-gray-50 dark:bg-muted'
							} rounded-md shadow-sm transition-colors duration-200
              hover:bg-slate-200 dark:hover:bg-slate-700`}
						>
							<TableCell>
								<img
									src={p.images[0].url}
									alt={p.title}
									className='w-16 h-12 object-cover rounded border'
								/>
							</TableCell>
							<TableCell>{p.title}</TableCell>
							<TableCell>
								৳{p.minPrice.toLocaleString()} - ৳{p.maxPrice.toLocaleString()}
							</TableCell>
							<TableCell>{p.agentName}</TableCell>
							<TableCell>
								{p.isAdvertised ? (
									<Button
										variant='outline'
										size='sm'
										onClick={() =>
											setSelected({
												id: p._id,
												title: p.title,
												isAdvertised: true,
											})
										}
									>
										Un‑advertise
									</Button>
								) : (
									<Button
										size='sm'
										onClick={() =>
											setSelected({
												id: p._id,
												title: p.title,
												isAdvertised: false,
											})
										}
									>
										Advertise
									</Button>
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			{/* Confirmation Modal */}
			{selected && (
				<ConfirmActionModal
					isOpen={!!selected}
					onClose={() => setSelected(null)}
					title={
						selected.isAdvertised
							? 'Un‑advertise this property?'
							: 'Advertise this property?'
					}
					description={`Are you sure you want to ${
						selected.isAdvertised ? 'remove from' : 'add to'
					} advertisements: “${selected.title}”?`}
					actionLabel={selected.isAdvertised ? 'Un‑advertise' : 'Advertise'}
					loading={advertiseM.isLoading || unadvertiseM.isLoading}
					onConfirm={() => {
						if (selected.isAdvertised) {
							unadvertiseM.mutate(selected.id);
						} else {
							advertiseM.mutate(selected.id);
						}
					}}
				/>
			)}
		</div>
	);
}
