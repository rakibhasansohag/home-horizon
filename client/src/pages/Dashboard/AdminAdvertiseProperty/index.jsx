import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import { Button } from '@/components/ui/button';
import PropertyCard from '@/components/Shared/PropertyCard';
import ConfirmActionModal from '@/components/shared/ConfirmActionModal';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-toastify';
import {
	FilterSection,
	ResultSummary,
	ShowMore,
	usePreview,
} from '@/pages/Dashboard/Components/DashboardFilter';

export default function AdminAdvertiseProperty() {
	const axios = useAxiosSecure();
	const qc = useQueryClient();

	const [selected, setSelected] = useState(null);
	const { filter, choose, visible, showMore } = usePreview('all');

	const { data: properties = [], isLoading } = useQuery({
		queryKey: ['admin‐verified-properties'],
		queryFn: () => axios.get('/admin/verified-properties').then((r) => r.data),
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

	const filtered =
		filter === 'advertised'
			? properties.filter((property) => property.isAdvertised)
			: filter === 'available'
				? properties.filter((property) => !property.isAdvertised)
				: properties;
	const rows = filtered.slice(0, visible);

	return (
		<div className='w-full max-w-7xl space-y-6'>
			<FilterSection
				label='Listings'
				value={filter}
				onChange={choose}
				options={[
					{ value: 'all', label: 'All' },
					{ value: 'advertised', label: 'Advertised' },
					{ value: 'available', label: 'Not advertised' },
				]}
			/>
			<ResultSummary
				label={
					filter === 'advertised'
						? 'Advertised'
						: filter === 'available'
							? 'Not advertised'
							: 'Verified listings'
				}
				value={filtered.length}
			/>
			{rows.length === 0 ? (
				<p className='text-base text-muted-foreground'>
					No listings for this filter.
				</p>
			) : (
			<div className='space-y-6'>
			<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3'>
				{rows.map((p) => (
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
			<ShowMore shown={rows.length} total={filtered.length} onMore={showMore} />
			</div>
			)}

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
