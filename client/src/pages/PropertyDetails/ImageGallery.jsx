export default function ImageGallery({ images }) {
	if (!images || images.length === 0) return null;

	const [firstImage, ...restImages] = images;

	return (
		<div className='section pt-6'>
			<img
				src={firstImage.url}
				alt='Property photo'
				className='aspect-video w-full object-cover'
			/>
			{restImages.length > 0 ? (
				<div className='mt-2 grid grid-cols-4 gap-2'>
					{restImages.map((img, i) => (
						<img
							key={img.url || i}
							src={img.url}
							alt=''
							loading='lazy'
							className='aspect-[4/3] w-full object-cover'
						/>
					))}
				</div>
			) : null}
		</div>
	);
}
