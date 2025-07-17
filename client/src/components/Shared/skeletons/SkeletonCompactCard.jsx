export default function SkeletonCompactCard() {
	return (
		<div className='flex gap-4 p-4 rounded-lg shadow bg-white dark:bg-slate-800 animate-pulse'>
			<div className='h-24 w-24 bg-muted rounded-md flex-shrink-0' />
			<div className='flex flex-col gap-2 w-full'>
				<div className='h-4 bg-muted rounded w-2/3' />
				<div className='h-3 bg-muted rounded w-1/2' />
				<div className='flex gap-2'>
					<div className='h-3 w-1/3 bg-muted rounded' />
					<div className='h-3 w-1/4 bg-muted rounded' />
				</div>
				<div className='h-8 w-full bg-muted rounded mt-2' />
			</div>
		</div>
	);
}
