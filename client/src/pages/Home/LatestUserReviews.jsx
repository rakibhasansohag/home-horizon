import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { gateQuery } from '@/lib/queryWait';
import Marquee from 'react-fast-marquee';
import { Star } from 'lucide-react';
import useAxios from '../../hooks/useAxios';

const PREVIEW_LIMIT = 8;

export default function LatestUserReviews() {
	const axios = useAxios();

	const reviewsQuery = useQuery({
		queryKey: ['latest-reviews', PREVIEW_LIMIT],
		queryFn: async () => {
			const res = await axios.get(
				`/public/latest-reviews?limit=${PREVIEW_LIMIT}`,
			);
			return res.data;
		},
	});

	if (gateQuery(reviewsQuery) === 'loading') {
		return (
			<section className='bg-paper py-16' aria-busy='true'>
				<div className='section'>
					<Skeleton className='h-10 w-64' />
					<div className='mt-6 flex gap-4 overflow-hidden'>
						{Array.from({ length: 3 }, (_, index) => (
							<Skeleton key={index} className='h-28 w-72 shrink-0' />
						))}
					</div>
				</div>
			</section>
		);
	}

	const reviews = reviewsQuery.data ?? [];
	if (!reviews.length) return null;

	const preview = reviews.slice(0, PREVIEW_LIMIT);

	return (
		<section className='overflow-hidden bg-paper py-16'>
			<div className='section'>
				<h2 className='font-display text-3xl'>Latest User Reviews</h2>
			</div>
			<Marquee
				autoFill
				pauseOnHover
				gradient={false}
				speed={32}
				className='mt-6'
			>
				{preview.map((review) => (
					<article
						key={review._id}
						className='mx-2 flex h-28 w-72 shrink-0 flex-col justify-between rounded-lg border border-border bg-surface p-4'
					>
						<p className='line-clamp-2 text-base text-foreground'>
							{review.reviewText}
						</p>
						<div className='flex items-center justify-between gap-3'>
							<p className='truncate text-sm text-muted-foreground'>
								{review.userName}
							</p>
							{Number.isFinite(Number(review.rating)) ? (
								<p className='flex shrink-0 items-center gap-1 text-sm text-foreground'>
									<Star
										className='size-4 fill-brand text-brand'
										aria-hidden='true'
									/>
									<span>{review.rating}/5</span>
								</p>
							) : null}
						</div>
					</article>
				))}
			</Marquee>
		</section>
	);
}
