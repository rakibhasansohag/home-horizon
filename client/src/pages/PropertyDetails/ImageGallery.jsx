import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogTitle,
} from '@/components/ui/dialog';

const PREVIEW_COUNT = 5;

export default function ImageGallery({ images }) {
	const [open, setOpen] = useState(false);
	const [active, setActive] = useState(0);

	if (!images || images.length === 0) return null;

	const preview = images.slice(0, PREVIEW_COUNT);
	const hiddenCount = images.length - PREVIEW_COUNT;

	const openAt = (index) => {
		setActive(index);
		setOpen(true);
	};

	const step = (direction) => {
		setActive((current) => (current + direction + images.length) % images.length);
	};

	return (
		<div className='section pt-6'>
			<div className='grid gap-2 md:grid-cols-[minmax(0,1.35fr)_minmax(12rem,0.8fr)] md:items-stretch'>
				<button
					type='button'
					onClick={() => openAt(0)}
					className='overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand'
					aria-label='Open photo'
				>
					<img
						src={preview[0].url}
						alt='Property photo'
						className='aspect-[4/3] max-h-72 w-full object-cover md:max-h-80'
					/>
				</button>

				{preview.length > 1 ? (
					<div className='grid grid-cols-4 gap-2 md:grid-cols-2'>
						{preview.slice(1).map((img, index) => {
							const imageIndex = index + 1;
							const isOverflowTile =
								imageIndex === PREVIEW_COUNT - 1 && hiddenCount > 0;
							return (
								<button
									key={`${img.url}-${imageIndex}`}
									type='button'
									onClick={() => openAt(imageIndex)}
									className='relative overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand'
									aria-label={
										isOverflowTile
											? `Open all ${images.length} photos`
											: `Open photo ${imageIndex + 1}`
									}
								>
									<img
										src={img.url}
										alt=''
										loading='lazy'
										className='aspect-[4/3] h-full w-full object-cover'
									/>
									{isOverflowTile ? (
										<span className='absolute inset-0 flex items-center justify-center bg-ink/60 text-lg font-semibold text-surface'>
											+{hiddenCount}
										</span>
									) : null}
								</button>
							);
						})}
					</div>
				) : null}
			</div>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className='w-[min(56rem,calc(100%-2rem))] max-w-none gap-3 bg-paper p-4 sm:max-w-none'>
					<DialogTitle className='pr-10 text-base font-semibold'>
						Photo {active + 1} of {images.length}
					</DialogTitle>
					<img
						src={images[active].url}
						alt={`Property photo ${active + 1}`}
						className='max-h-[65vh] w-full rounded-lg object-contain'
					/>
					<div className='flex items-center justify-between gap-3'>
						<button
							type='button'
							onClick={() => step(-1)}
							className='inline-flex size-11 items-center justify-center rounded-full border border-border transition-colors duration-200 hover:border-brand hover:text-brand'
							aria-label='Previous photo'
						>
							<ChevronLeft />
						</button>
						<div className='flex min-w-0 flex-1 gap-2 overflow-x-auto'>
							{images.map((img, index) => (
								<button
									key={`${img.url}-${index}`}
									type='button'
									onClick={() => setActive(index)}
									aria-label={`Show photo ${index + 1}`}
									aria-current={index === active ? 'true' : undefined}
									className={`shrink-0 overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
										index === active ? 'ring-2 ring-brand' : ''
									}`}
								>
									<img
										src={img.url}
										alt=''
										className='h-14 w-20 object-cover'
									/>
								</button>
							))}
						</div>
						<button
							type='button'
							onClick={() => step(1)}
							className='inline-flex size-11 items-center justify-center rounded-full border border-border transition-colors duration-200 hover:border-brand hover:text-brand'
							aria-label='Next photo'
						>
							<ChevronRight />
						</button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
