import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogTitle,
} from '@/components/ui/dialog';

const PREVIEW_COUNT = 5;

export default function ImageGallery({ images }) {
	const [open, setOpen] = useState(false);
	const [active, setActive] = useState(0);
	const photos = (images || []).filter((image) => image?.url);

	useEffect(() => {
		if (!open) return undefined;
		const onKeyDown = (event) => {
			if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
			event.preventDefault();
			const direction = event.key === 'ArrowRight' ? 1 : -1;
			setActive((current) => (current + direction + photos.length) % photos.length);
		};
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [open, photos.length]);

	if (photos.length === 0) {
		return (
			<div className='section pt-6'>
				<div className='flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-paper px-6 py-12 text-center'>
					<ImageOff className='size-8 text-muted-foreground' aria-hidden='true' />
					<p className='mt-3 text-lg font-semibold'>No photos yet</p>
					<p className='mt-1 max-w-sm text-sm text-muted-foreground'>
						This listing does not include any photos.
					</p>
				</div>
			</div>
		);
	}

	const preview = photos.slice(0, PREVIEW_COUNT);
	const hiddenCount = photos.length - PREVIEW_COUNT;

	const openAt = (index) => {
		setActive(index);
		setOpen(true);
	};

	const step = (direction) => {
		setActive((current) => (current + direction + photos.length) % photos.length);
	};

	return (
		<div className='section pt-6'>
			<div className='grid gap-2 md:grid-cols-[minmax(0,1.6fr)_minmax(16rem,0.9fr)] md:items-stretch'>
				<button
					type='button'
					onClick={() => openAt(0)}
					className='relative aspect-[4/3] overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand md:aspect-auto md:h-full'
					aria-label='Open photo'
				>
					<img
						src={preview[0].url}
						alt='Property photo'
						className='absolute inset-0 h-full w-full object-cover'
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
									className='relative aspect-[4/3] overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand'
									aria-label={
										isOverflowTile
											? `Open all ${photos.length} photos`
											: `Open photo ${imageIndex + 1}`
									}
								>
									<img
										src={img.url}
										alt=''
										loading='lazy'
										className='absolute inset-0 h-full w-full object-cover'
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
						Photo {active + 1} of {photos.length}
					</DialogTitle>
					<p className='sr-only'>Use the left and right arrow keys to change photos.</p>
					<img
						src={photos[active].url}
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
							{photos.map((img, index) => (
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
