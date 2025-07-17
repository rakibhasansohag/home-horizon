import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';

import useAxiosSecure from '@/hooks/useAxiosSecure';
import { Star } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ReviewModal({
	propertyId,
	agentId,
	onClose,
	user,
	onSuccess,
	propertyTitle,
	agentName,
}) {
	const axiosSecure = useAxiosSecure();
	const { register, handleSubmit, setValue, watch, reset } = useForm();
	const rating = watch('rating') || 0;

	const onSubmit = async (data) => {
		await axiosSecure.post('/reviews', {
			...data,
			propertyId,
			agentId,
			userId: user?.uid,
			userEmail: user?.email,
			userName: user?.displayName,
			userImage: user?.photoURL,
			propertyTitle,
			agentName,
		});
		reset();
		onClose();
		toast.success('Review submitted successfully');
		onSuccess();
	};
	return (
		<Dialog open onOpenChange={onClose}>
			<DialogContent className='max-w-md'>
				<h3 className='text-xl font-semibold mb-4'>Leave a Review</h3>
				<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
					<div className='flex gap-1'>
						{[1, 2, 3, 4, 5].map((num) => (
							<Star
								key={num}
								className={`w-6 h-6 cursor-pointer ${
									rating >= num
										? 'fill-yellow-400 text-yellow-500'
										: 'text-yellow-400'
								}`}
								onClick={() => setValue('rating', num)}
							/>
						))}
					</div>
					<textarea
						{...register('reviewText')}
						className='w-full border rounded-md p-2'
						placeholder='Write your review...'
						required
					/>
					<Button type='submit' className='w-full'>
						Submit Review
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
