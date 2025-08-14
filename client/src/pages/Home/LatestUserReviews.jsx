import { useQuery } from '@tanstack/react-query';
import Marquee from 'react-fast-marquee';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
import { FaStar, FaRegStar } from 'react-icons/fa6';
import useAxios from '../../hooks/useAxios';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function LatestUserReviews() {
	const axios = useAxios();

	const { data: reviews = [], isLoading } = useQuery({
		queryKey: ['latest-reviews'],
		queryFn: async () => {
			const res = await axios.get('/public/latest-reviews?limit=14');
			return res.data;
		},
	});

	if (isLoading || !reviews.length) return null;

	return (
		<section className='px-4 py-16 bg-background dark:bg-input '>
			<h2 className='text-3xl font-bold text-center mb-10'>
				Latest User Reviews
			</h2>

			<Marquee
				pauseOnHover
				gradient={false}
				speed={45}
				className='overflow-hidden'
			>
				{reviews.map((review, idx) => (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: idx * 0.1 }}
						key={review._id}
						className='mx-4 w-[20rem] bg-background shadow-md rounded-xl border border-border p-4 space-y-3'
					>
						{/* Avatar & Info */}
						<div className='flex items-center gap-3'>
							<Avatar className='w-10 h-10'>
								<AvatarImage src={review?.userImage} />
								<AvatarFallback>
									{review.userName?.charAt(0).toUpperCase() || 'U'}
								</AvatarFallback>
							</Avatar>
							<div>
								<p className='font-semibold text-foreground'>
									{review.userName}
								</p>
								<p className='text-xs text-muted-foreground'>
									{review.userEmail}
								</p>
							</div>
						</div>

						{/* Star Rating */}
						<div className='flex gap-1 text-yellow-400'>
							{[...Array(5)].map((_, i) =>
								i < review.rating ? (
									<FaStar key={i} className='w-4 h-4' />
								) : (
									<FaRegStar key={i} className='w-4 h-4 text-gray-300' />
								),
							)}
						</div>

						{/* Review Text */}
						<p className='text-sm text-muted-foreground line-clamp-4'>
							“{review.reviewText}”
						</p>
					</motion.div>
				))}
			</Marquee>
		</section>
	);
}
