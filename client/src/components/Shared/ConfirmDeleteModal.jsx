import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { toast } from 'react-toastify';

export default function ConfirmDeleteModal({ isOpen, propertyId, onClose }) {
	const axiosSecure = useAxiosSecure();
	const queryClient = useQueryClient();

	const { mutate, isLoading } = useMutation({
		mutationFn: async () => {
			const res = await axiosSecure.delete(`/properties/${propertyId}`);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries(['my-properties']);
			toast.success('Property deleted successfully');
			onClose();
		},
		onError: () => {
			toast.error('Failed to delete property');
		},
	});

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Confirm Delete</DialogTitle>
				</DialogHeader>
				<p>Are you sure you want to delete this property?</p>
				<DialogFooter className='mt-4'>
					<Button variant='outline' onClick={onClose} disabled={isLoading}>
						Cancel
					</Button>
					<Button
						variant='destructive'
						onClick={() => mutate()}
						disabled={isLoading}
					>
						{isLoading ? 'Deleting...' : 'Delete'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
