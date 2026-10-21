import { useQuery } from '@tanstack/react-query';
import Marquee from 'react-fast-marquee';
import { Star } from 'lucide-react';
import useAxios from '../../hooks/useAxios';

const PREVIEW_LIMIT = 8;

export default function LatestUserReviews() {
	const axios = useAxios();

	const { data: reviews = [], isLoading } = useQuery({
		queryKey: ['latest-reviews', PREVIEW_LIMIT],
		queryFn: async () => {
			const res = await axios.get(
				`/public/latest-reviews?limit=${PREVIEW_LIMIT}`,
			);
			return res.data;
		},
	});

	if (isLoading || !reviews.length) return null;

	const preview = reviews.slice(0, PREVIEW_LIMIT);

	return (
		<section className='overflow-hidden bg-paper py-16'>
			<div className='section'>
				<h2 className='font-display text-3xl'>Latest User Reviews</h2>
			</div>
			<Marquee
				pauseOnHover
				gradient={false}
				speed={32}
				className='mt-6'
			>
				{preview.map((review) => (
					<article
						key={review._id}
						className='mx-2 w-72 rounded-lg border border-border bg-surface p-4 transition-colors duration-200 hover:border-brand'
					>
						<div className='flex items-center justify-between gap-3'>
							<p className='truncate font-semibold'>{review.userName}</p>
							{Number.isFinite(Number(review.rating)) ? (
								<p className='flex shrink-0 items-center gap-1 text-sm text-warning'>
									<Star
										className='size-3.5 fill-warning text-warning'
										aria-hidden='true'
									/>
									<span>{review.rating}/5</span>
								</p>
							) : null}
						</div>
						<p className='mt-2 line-clamp-2 text-sm text-muted-foreground'>
							{review.reviewText}
						</p>
					</article>
				))}
			</Marquee>
		</section>
	);
}
