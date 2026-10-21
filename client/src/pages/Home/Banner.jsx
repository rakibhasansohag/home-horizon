import { Search } from 'lucide-react';
import banner from '@/assets/banner.jpg';

export default function Banner() {
	return (
		<section
			className='relative h-[32rem] w-full bg-cover bg-center'
			style={{ backgroundImage: `url(${banner})` }}
		>
			<div className='absolute inset-0 bg-black/40' />

			<div className='section relative z-10 flex h-full flex-col justify-center px-4 text-white'>
				<h1 className='text-4xl font-extrabold leading-tight md:text-5xl'>
					Find the right home
					<span className='block'>at the right price</span>
				</h1>

				<div className='mt-8 w-full max-w-xl'>
					<div className='flex overflow-hidden rounded-lg bg-white text-black shadow-lg'>
						<input
							type='text'
							placeholder='Enter an address, neighborhood, city, or ZIP code'
							className='min-h-14 w-full px-4 text-base outline-none placeholder:text-neutral-500'
						/>
						<button
							type='button'
							className='inline-flex shrink-0 items-center justify-center px-4'
							aria-label='Search'
						>
							<Search />
						</button>
					</div>
				</div>
			</div>
		</section>
	);
}
