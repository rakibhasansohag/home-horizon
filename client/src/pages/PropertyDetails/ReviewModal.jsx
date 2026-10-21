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
	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors, isSubmitting },
	} = useForm();
	const rating = Number(watch('rating')) || 0;

	const onSubmit = async (data) => {
		try {
			await axiosSecure.post('/reviews', {
				...data,
				rating: Number(data.rating),
				reviewText: data.reviewText.trim(),
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
		} catch (error) {
			toast.error(error?.response?.data?.error || 'Could not submit the review');
		}
	};
	return (
		<Dialog open onOpenChange={onClose}>
			<DialogContent className='max-w-md'>
				<h3 className='text-xl font-semibold mb-4'>Leave a Review</h3>
				<form onSubmit={handleSubmit(onSubmit)} className='space-y-4' noValidate>
					<fieldset>
						<legend className='mb-2 text-sm font-medium'>Rating</legend>
						<input
							type='hidden'
							{...register('rating', {
								validate: (value) =>
									[1, 2, 3, 4, 5].includes(Number(value)) ||
									'Choose a rating from 1 to 5 stars.',
							})}
						/>
						<div className='flex gap-1' role='group' aria-label='Star rating'>
							{[1, 2, 3, 4, 5].map((num) => (
								<button
									key={num}
									type='button'
									aria-label={`${num} star${num > 1 ? 's' : ''}`}
									aria-pressed={rating === num}
									onClick={() =>
										setValue('rating', num, { shouldValidate: true })
									}
									className='inline-flex size-11 items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand'
								>
									<Star
										className={`size-6 ${
											rating >= num
												? 'fill-brand text-brand'
												: 'text-muted-foreground'
										}`}
									/>
								</button>
							))}
						</div>
						{errors.rating ? (
							<p className='mt-1 text-sm text-destructive'>{errors.rating.message}</p>
						) : null}
					</fieldset>
					<div>
						<label htmlFor='reviewText' className='mb-2 block text-sm font-medium'>
							Review
						</label>
						<textarea
							id='reviewText'
							{...register('reviewText', {
								validate: (value) => {
									const text = String(value || '').trim();
									if (!text) return 'Write your review.';
									if (text.length < 10) {
										return 'Write at least 10 characters about this home.';
									}
									if (!/[A-Za-z]/.test(text)) {
										return 'Write the review in words.';
									}
									return true;
								},
							})}
							rows={4}
							aria-invalid={errors.reviewText ? 'true' : 'false'}
							className='w-full rounded-md border border-border bg-surface p-3 text-base text-foreground'
							placeholder='Write your review...'
						/>
						{errors.reviewText ? (
							<p className='mt-1 text-sm text-destructive'>
								{errors.reviewText.message}
							</p>
						) : null}
					</div>
					<Button type='submit' className='w-full' disabled={isSubmitting}>
						Submit Review
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
