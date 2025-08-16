import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import ReviewCard from './ReviewCard';

export default function ReviewsCarousel({ reviews = [] }) {
	if (!reviews || reviews.length === 0) {
		return (
			<div className='text-muted-foreground text-center py-6'>
				No reviews yet.
			</div>
		);
	}

	return (
		<Swiper
			modules={[Navigation, Autoplay]}
			spaceBetween={16}
			slidesPerView={1}
			loop
			speed={2000}
			autoplay={{
				delay: 3500,
				disableOnInteraction: true,
			}}
			grabCursor
			className='py-2'
			effect='fade'
		>
			{reviews.map((r) => (
				<SwiperSlide key={r._id} className='h-full w-full'>
					<ReviewCard review={r} />
				</SwiperSlide>
			))}
		</Swiper>
	);
}
