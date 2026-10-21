import { Search } from 'lucide-react';
import banner from '@/assets/banner.jpg';

export default function Banner() {
	return (
		<section className='relative h-[28rem] overflow-hidden md:h-[32rem]'>
			<img
				src={banner}
				alt='Red and grey houses along a residential street'
				className='absolute inset-0 h-full w-full object-cover'
			/>
			<div className='absolute inset-0 bg-ink/45' />

			<div className='section relative z-10 flex h-full items-center'>
				<div className='w-full max-w-xl rounded-lg bg-paper p-6 text-ink md:p-8'>
					<h1 className='font-display text-4xl md:text-5xl'>
						Find the right home
						<span className='block'>at the right price</span>
					</h1>

					<div className='mt-6 flex min-w-0 items-center rounded-md border border-line bg-surface'>
						<input
							type='text'
							placeholder='Enter an address, neighborhood, city, or ZIP code'
							className='min-h-11 min-w-0 flex-1 bg-transparent px-3 text-base text-ink outline-none placeholder:text-ink-muted'
						/>
						<button
							type='button'
							className='inline-flex size-11 shrink-0 items-center justify-center text-ink'
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
