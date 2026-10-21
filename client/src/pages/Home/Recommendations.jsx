import recommendationImg from '@/assets/recomand.webp';
import useAuth from '@/hooks/useAuth';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';

const dummyHomes = Array(6).fill({
	price: '$695,000',
	beds: 4,
	baths: 3,
	sqft: 3102,
	type: 'House for Sale',
	img: 'https://cdn.pixabay.com/photo/2014/07/10/17/18/large-home-389271_1280.jpg',
});

function Recommendations({ searchQuery = '' }) {
	const { user } = useAuth();

	return (
		<section className='border-b border-border bg-paper py-12'>
			<div className='section grid items-center gap-8 md:grid-cols-2'>
				<div>
					{!user ? (
						<div className='max-w-md'>
							<h2 className='font-display text-3xl'>
								Get home recommendations
							</h2>
							<p className='mt-3 text-base text-muted-foreground'>
								Sign in for a more personalized experience.
							</p>
							<Button variant='outline' asChild className='mt-6'>
								<Link to='/auth/login'>Sign In</Link>
							</Button>
						</div>
					) : (
						<>
							{searchQuery ? (
								<>
									{/* TODO : Will updated this after completing the project need lot of backend logic in this right now it' going to be static */}
									<h3 className='font-display text-2xl'>
										Recommended homes based on your search
									</h3>
									<Swiper
										className='mt-4'
										spaceBetween={16}
										slidesPerView={1.15}
										breakpoints={{
											640: { slidesPerView: 2 },
											1024: { slidesPerView: 2 },
										}}
										navigation
										modules={[Navigation]}
									>
										{dummyHomes.map((home, idx) => (
											<SwiperSlide key={idx}>
												<div className='overflow-hidden rounded-lg border border-border bg-surface'>
													<img
														src={home.img}
														alt='Large house with a lawn'
														className='aspect-[4/3] w-full object-cover'
													/>
													<div className='space-y-1 p-4'>
														<p className='text-xl font-semibold tabular-nums'>
															{home.price}
														</p>
														<p className='text-sm text-muted-foreground'>
															{home.beds} bd · {home.baths} ba · {home.sqft} sqft
														</p>
														<p className='text-sm text-muted-foreground'>
															{home.type}
														</p>
													</div>
												</div>
											</SwiperSlide>
										))}
									</Swiper>
								</>
							) : (
								<div className='max-w-md'>
									<h3 className='font-display text-3xl'>
										Recommendations underway
									</h3>
									<p className='mt-3 text-base text-muted-foreground'>
										Search and save a few homes you like and we’ll find
										recommendations for you.
									</p>
								</div>
							)}
						</>
					)}
				</div>

				<img
					src={recommendationImg}
					alt='Sample recommendation cards laid over a brick house'
					className='mx-auto w-full max-w-md object-contain'
				/>
			</div>
		</section>
	);
}

export default Recommendations;
