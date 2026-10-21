import { Button } from '@/components/ui/button';
import { Link } from 'react-router';

export default function NotFoundPage() {
	return (
		<div className='flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center'>
			<p className='font-display text-6xl text-foreground'>404</p>
			<h1 className='mt-2 text-2xl font-semibold'>Page not found</h1>
			<p className='mt-2 max-w-md text-base text-muted-foreground'>
				The page you are looking for does not exist or has been moved.
			</p>
			<Button asChild className='mt-6'>
				<Link to='/'>Back to home</Link>
			</Button>
		</div>
	);
}
