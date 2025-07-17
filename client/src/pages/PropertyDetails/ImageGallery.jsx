// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

export default function ImageGallery({ images }) {
	if (!images || images.length === 0) return null;

	const firstImage = images[0];
	const restImages = images.slice(1);

	return (
		<div className='w-full'>
			{/* Mobile View */}
			<div className='block md:hidden'>
				<Swiper spaceBetween={10} slidesPerView={1}>
					{images.map((img, i) => (
						<SwiperSlide key={i}>
							<motion.img
								src={img.url}
								alt={`Image ${i}`}
								className='w-full h-64 object-cover rounded-md'
								whileHover={{ scale: 1.02 }}
								transition={{ duration: 0.3 }}
							/>
						</SwiperSlide>
					))}
				</Swiper>
			</div>

			{/* Desktop View */}
			<div className='hidden md:grid grid-cols-2 gap-2 max-h-[400px] overflow-hidden mb-10'>
				<div className='col-span-1'>
					<motion.img
						src={firstImage.url}
						alt='Main'
						className='w-full h-full object-cover rounded-lg max-h-[400px]'
						whileHover={{ scale: 1.02 }}
						transition={{ duration: 0.3 }}
					/>
				</div>

				<div className='grid grid-cols-2 grid-rows-2 gap-2'>
					{restImages.slice(0, 4).map((img, i) => (
						<motion.img
							key={i}
							src={img.url}
							alt={`Image ${i + 1}`}
							className='w-full h-full object-cover rounded-lg max-h-[195px]'
							whileHover={{ scale: 1.02 }}
							transition={{ duration: 0.3 }}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
