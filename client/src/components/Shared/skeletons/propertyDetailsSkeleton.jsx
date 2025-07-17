import { Skeleton } from '@/components/ui/skeleton';

export function PropertyDetailsSkeleton() {
	return (
		<section>
			{/* Image Placeholder */}
			<div className='w-full h-[350px] mb-6'>
				<Skeleton className='w-full h-full rounded-lg' />
			</div>

			{/* Main Content Layout */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 section'>
				{/* Left Side (More Width - col-span-2) */}
				<div className='lg:col-span-2 space-y-6'>
					<Skeleton className='h-8 w-1/2' />
					<Skeleton className='h-5 w-full' />
					<Skeleton className='h-5 w-1/3' />
					<Skeleton className='h-5 w-1/4' />

					<div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
						{Array.from({ length: 6 }).map((_, i) => (
							<div
								key={i}
								className='flex items-center gap-3 p-3 bg-muted rounded-md'
							>
								<Skeleton className='w-6 h-6 rounded-full' />
								<div className='space-y-1'>
									<Skeleton className='w-20 h-3' />
									<Skeleton className='w-16 h-3' />
								</div>
							</div>
						))}
					</div>

					{/* Review section */}
					<div className='space-y-2'>
						<Skeleton className='h-6 w-32' />
						<div className='grid sm:grid-cols-2 gap-4'>
							{Array.from({ length: 4 }).map((_, i) => (
								<Skeleton key={i} className='h-24 w-full rounded-md' />
							))}
						</div>
						<Skeleton className='h-10 w-32' />
					</div>
				</div>

				{/* Right Sidebar */}
				<div className='space-y-4'>
					<Skeleton className='h-40 w-full rounded-md' />
					<Skeleton className='h-12 w-full rounded-md' />
					<Skeleton className='h-12 w-full rounded-md' />
					<Skeleton className='h-12 w-full rounded-md' />
				</div>
			</div>
		</section>
	);
}
