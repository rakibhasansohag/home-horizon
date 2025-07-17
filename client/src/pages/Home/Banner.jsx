import React from 'react';
import banner from '@/assets/banner.jpg';
import { FaMagnifyingGlass } from 'react-icons/fa6';

export default function Banner() {
	return (
		<section
			className='w-full h-[32rem] bg-cover bg-center relative'
			style={{ backgroundImage: `url(${banner})` }}
		>
			{/* Overlay */}
			<div className='absolute inset-0 bg-black/40' />

			{/* Content */}
			<div className='relative z-10 h-full flex flex-col  justify-center  text-white px-4 section'>
				<h1 className='text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-md '>
					Find the right home
					<span className='block'>at the right price</span>
				</h1>

				<div className='mt-8 w-full max-w-xl'>
					<div className='flex rounded-lg overflow-hidden shadow-lg bg-white text-black'>
						<input
							type='text'
							placeholder='Enter an address, neighborhood, city, or ZIP code'
							className='w-full px-4 py-5 outline-none text-sm'
						/>
						<button className='px-4 hover:bg-primary/90 text-black text-base font-semibold  transition-all cursor-pointer'>
							<FaMagnifyingGlass />
						</button>
					</div>
				</div>
			</div>
		</section>
	);
}
