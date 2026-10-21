import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
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
		<section className='bg-paper py-16'>
			<div className='section'>
				<h2 className='font-display text-3xl'>Latest User Reviews</h2>
				<ul className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
					{reviews.map((review) => (
						<li
							key={review._id}
							className='flex flex-col gap-3 rounded-lg border border-border bg-surface p-4'
						>
							<div className='flex items-center gap-3'>
								<Avatar className='size-10'>
									<AvatarImage src={review?.userImage} alt='' />
									<AvatarFallback>
										{review.userName?.charAt(0).toUpperCase() || 'U'}
									</AvatarFallback>
								</Avatar>
								<div className='min-w-0'>
									<p className='truncate font-semibold text-foreground'>
										{review.userName}
									</p>
									<p className='truncate text-sm text-muted-foreground'>
										{review.userEmail}
									</p>
								</div>
							</div>

							{Number.isFinite(Number(review.rating)) ? (
								<p className='flex items-center gap-1 text-warning'>
									<span className='sr-only'>{review.rating} out of 5</span>
									{[...Array(5)].map((_, i) => (
										<Star
											key={i}
											className={
												i < review.rating
													? 'size-4 fill-warning text-warning'
													: 'size-4 text-line'
											}
											aria-hidden='true'
										/>
									))}
								</p>
							) : null}

							<p className='line-clamp-4 text-base text-foreground'>
								{review.reviewText}
							</p>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
