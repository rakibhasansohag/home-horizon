export default function GlobalLoading() {
	return (
		<div
			className='fixed inset-0 z-50 flex items-center justify-center bg-paper'
			role='status'
		>
			<p className='text-base text-muted-foreground'>Loading</p>
		</div>
	);
}
