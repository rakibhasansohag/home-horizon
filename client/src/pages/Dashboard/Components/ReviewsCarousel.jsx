import ReviewCard from './ReviewCard';

export default function ReviewsCarousel({ reviews = [] }) {
	if (!reviews.length) {
		return (
			<p className='py-6 text-center text-muted-foreground'>No reviews yet.</p>
		);
	}

	return (
		<ul className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
			{reviews.map((review) => (
				<li key={review._id}>
					<ReviewCard review={review} />
				</li>
			))}
		</ul>
	);
}
