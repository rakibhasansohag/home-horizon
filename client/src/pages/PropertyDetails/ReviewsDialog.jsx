import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import ReviewCard from './ReviewCard';

export const REVIEW_PREVIEW = 6;

export function reviewSummary(reviews) {
	const counts = [0, 0, 0, 0, 0];
	let sum = 0;
	let rated = 0;
	for (const review of reviews) {
		const rating = Math.round(Number(review.rating));
		if (rating >= 1 && rating <= 5) {
			counts[rating - 1] += 1;
			sum += rating;
			rated += 1;
		}
	}
	return {
		average: rated ? sum / rated : 0,
		rated,
		counts,
	};
}

export function ReviewSummary({ reviews }) {
	const summary = reviewSummary(reviews);
	if (!summary.rated) return null;
	return (
		<div className='flex items-center gap-2'>
			<Star className='size-5 fill-warning text-warning' aria-hidden='true' />
			<p className='text-xl font-semibold tabular-nums'>
				{summary.average.toFixed(1)}
			</p>
			<p className='text-base text-muted-foreground'>
				{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
			</p>
		</div>
	);
}

export default function ReviewsDialog({ open, onOpenChange, reviews }) {
	const summary = reviewSummary(reviews);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-h-[min(40rem,calc(100dvh-2rem))] overflow-y-auto sm:max-w-3xl'>
				<DialogHeader>
					<DialogTitle>
						{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
					</DialogTitle>
				</DialogHeader>
				{summary.rated ? (
					<div className='grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center'>
						<div>
							<p className='font-display text-4xl tabular-nums'>
								{summary.average.toFixed(1)}
							</p>
							<p className='text-sm text-muted-foreground'>out of 5</p>
						</div>
						<ul className='space-y-1'>
							{[5, 4, 3, 2, 1].map((star) => {
								const count = summary.counts[star - 1];
								const width = summary.rated
									? Math.round((count / summary.rated) * 100)
									: 0;
								return (
									<li key={star} className='flex items-center gap-3'>
										<span className='w-4 text-sm tabular-nums'>{star}</span>
										<div className='h-1.5 flex-1 overflow-hidden rounded-full bg-muted'>
											<div
												className='h-full rounded-full bg-brand'
												style={{ width: `${width}%` }}
											/>
										</div>
										<span className='w-8 text-right text-sm tabular-nums text-muted-foreground'>
											{count}
										</span>
									</li>
								);
							})}
						</ul>
					</div>
				) : null}
				<div className='grid gap-4 sm:grid-cols-2'>
					{reviews.map((review) => (
						<ReviewCard key={review._id} review={review} />
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
}

export function ShowAllReviews({ count, onClick }) {
	if (count <= REVIEW_PREVIEW) return null;
	return (
		<Button type='button' variant='outline' onClick={onClick}>
			Show all {count} reviews
		</Button>
	);
}
