import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import { Button } from '@/components/ui/button';
import PropertyCard from '@/components/Shared/PropertyCard';
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
			<div className='p-4 bg-surface rounded-lg border flex items-center justify-between'>
				<div>
					<p className='text-sm text-muted-foreground'>Total Advertised</p>
					<p className='text-3xl font-semibold tabular-nums'>{stats?.total ?? 0}</p>
				</div>
			</div>

			<div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'>
				{properties.map((p) => (
					<PropertyCard key={p._id} property={p}>
						{p.isAdvertised ? (
							<Button
								variant='outline'
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
								variant='accent'
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
					</PropertyCard>
				))}
			</div>

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
