import React from 'react';
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
		<div className='bg-white dark:bg-background py-10'>
			<div className='section flex gap-6 justify-between md:flex-row flex-col items-center'>
				<div className='w-full md:w-1/2'>
					{/* Not logged in */}
					{!user ? (
						<div className='md:text-left md:flex flex-col justify-center items-center '>
							<h2 className='text-2xl font-bold mb-2'>
								Get home recommendations
							</h2>
							<p className='text-muted-foreground mb-4'>
								Sign in for a more personalized experience.
							</p>
							<Button variant='outline'>
								<Link to={'/auth/login'}>Sign In</Link>
							</Button>
						</div>
					) : (
						<>
							{/* Logged in */}
							{searchQuery ? (
								<>
									{/* TODO : Will updated this after completing the project need lot of backend logic in this right now it' going to be static */}
									<h3 className='text-xl font-semibold mb-4'>
										Recommended homes based on your search
									</h3>
									<Swiper
										spaceBetween={20}
										slidesPerView={1.2}
										breakpoints={{
											640: { slidesPerView: 2 },
											1024: { slidesPerView: 2.2 },
										}}
										navigation
										modules={[Navigation]}
									>
										{dummyHomes.map((home, idx) => (
											<SwiperSlide key={idx}>
												<div className='rounded-lg overflow-hidden border bg-card hover:shadow-md transition'>
													<img
														src={home.img}
														alt='home'
														className='w-full h-44 object-cover'
													/>
													<div className='p-4'>
														<p className='font-semibold text-lg'>
															{home.price}
														</p>
														<p className='text-sm text-muted-foreground'>
															{home.beds} bd | {home.baths} ba | {home.sqft}{' '}
															sqft
														</p>
														<p className='text-xs text-muted-foreground'>
															{home.type}
														</p>
													</div>
												</div>
											</SwiperSlide>
										))}
									</Swiper>
								</>
							) : (
								<div className='flex items-center justify-center flex-col'>
									<h3 className='text-xl font-semibold mb-2'>
										Recommendations underway
									</h3>
									<p className='text-muted-foreground max-w-sm'>
										Search and save a few homes you like and we’ll find
										recommendations for you.
									</p>
								</div>
							)}
						</>
					)}
				</div>

				{/* Right - image */}
				<div className='w-full md:w-1/2'>
					<img
						src={recommendationImg}
						alt='recommendation'
						className='w-full h-auto max-w-md mx-auto'
					/>
				</div>
			</div>
		</div>
	);
}

export default Recommendations;
