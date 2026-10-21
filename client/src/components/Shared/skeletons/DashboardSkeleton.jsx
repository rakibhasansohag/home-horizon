import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardSkeleton() {
	return (
		<div className='space-y-4' aria-busy='true'>
			<span className='sr-only'>Loading</span>
			<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
				{Array.from({ length: 3 }, (_, index) => (
					<Skeleton key={index} className='h-24' />
				))}
			</div>
			<Skeleton className='h-64 w-full' />
			<Skeleton className='h-40 w-full' />
		</div>
	);
}
