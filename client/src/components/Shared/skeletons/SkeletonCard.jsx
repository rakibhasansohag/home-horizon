export default function SkeletonCard() {
	return (
		<div className='bg-white dark:bg-slate-800 rounded-xl shadow p-4 space-y-3 animate-pulse'>
			<div className='h-40 w-full bg-muted rounded-md' />
			<div className='h-4 bg-muted w-3/4 rounded' />
			<div className='h-3 bg-muted w-1/2 rounded' />
			<div className='flex items-center gap-2 mt-1'>
				<div className='h-8 w-8 rounded-full bg-muted' />
				<div className='h-3 w-1/3 bg-muted rounded' />
			</div>
			<div className='h-3 w-1/2 bg-muted rounded' />
			<div className='h-3 w-1/3 bg-muted rounded' />
			<div className='flex gap-2 mt-3'>
				<div className='h-8 w-full bg-muted rounded' />
				<div className='h-8 w-full bg-muted rounded' />
			</div>
		</div>
	);
}
