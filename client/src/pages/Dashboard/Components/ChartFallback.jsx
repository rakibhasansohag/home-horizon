export default function ChartFallback({ title, message }) {
	return (
		<div className='flex h-full min-h-36 flex-col justify-center rounded-md border border-dashed border-border px-4 py-6'>
			<p className='font-medium'>{title}</p>
			<p className='mt-1 max-w-md text-sm text-muted-foreground'>{message}</p>
		</div>
	);
}
