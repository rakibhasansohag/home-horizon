// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

export default function ReviewCard({ review }) {
	const stars = Array.from({ length: 5 }, (_, i) => (
		<Star
			key={i}
			className={`w-4 h-4 ${
				i < review.rating ? 'text-yellow-500 fill-yellow-400' : 'text-muted'
			}`}
		/>
	));

	return (
		<motion.div
			layout
			className='p-4 border rounded-xl bg-muted  flex flex-col justify-between h-full'
		>
			<div className='flex items-center gap-3 mb-8'>
				<Avatar>
					<AvatarImage src={review.userImage} />
					<AvatarFallback>{review.userName?.[0]}</AvatarFallback>
				</Avatar>
				<div>
					<p className='font-medium'>{review.userName || 'Anonymous'}</p>
					<p className='text-xs text-muted-foreground'>
						{review.userEmail || 'N/A'}
					</p>
				</div>
			</div>

			<div className='mb-6'>
				<div className='flex items-center gap-1'>{stars}</div>
				<p className='text-sm text-muted-foreground'>{review.reviewText}</p>
			</div>

			<p className='text-xs text-right'>
				Reviewed on {new Date(review.createdAt).toLocaleDateString()}
			</p>
		</motion.div>
	);
}
