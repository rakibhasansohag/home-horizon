import { Search } from 'lucide-react';
import banner from '@/assets/banner.jpg';

export default function Banner() {
	return (
		<section className='border-b border-border bg-paper'>
			<div className='section grid items-start gap-8 py-8 md:grid-cols-12 md:gap-10 md:py-14'>
				<div className='md:col-span-5'>
					<h1 className='font-display text-4xl md:text-5xl'>
						Find the right home
						<span className='mt-1 block text-ink-muted'>at the right price</span>
					</h1>

					<div className='mt-8 flex min-w-0 items-center border-b border-ink focus-within:border-brand'>
						<input
							type='text'
							placeholder='Enter an address, neighborhood, city, or ZIP code'
							className='min-h-11 min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-muted'
						/>
						<button
							type='button'
							className='inline-flex size-11 shrink-0 items-center justify-center text-ink transition-colors duration-200 hover:text-brand'
							aria-label='Search'
						>
							<Search />
						</button>
					</div>
				</div>

				<figure className='md:col-span-7'>
					<img
						src={banner}
						alt='Red and grey houses along a residential street'
						className='aspect-[4/3] w-full object-cover md:aspect-[5/4]'
					/>
					<figcaption className='mt-2 text-sm text-muted-foreground'>
						Red and grey houses along a residential street
					</figcaption>
				</figure>
			</div>
		</section>
	);
}
