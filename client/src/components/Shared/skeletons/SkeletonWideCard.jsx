export default function SkeletonWideCard() {
	return (
		<div className='flex flex-col lg:flex-row gap-4 p-4 rounded-xl shadow bg-white dark:bg-slate-800 animate-pulse'>
			<div className='h-40 w-full lg:w-64 bg-muted rounded-md' />
			<div className='flex flex-col gap-2 flex-1'>
				<div className='h-4 w-3/4 bg-muted rounded' />
				<div className='h-3 w-1/2 bg-muted rounded' />
				<div className='h-3 w-1/3 bg-muted rounded' />
				<div className='h-3 w-2/5 bg-muted rounded' />
				<div className='flex gap-2 mt-4'>
					<div className='h-8 w-full bg-muted rounded' />
					<div className='h-8 w-full bg-muted rounded' />
				</div>
			</div>
		</div>
	);
}
