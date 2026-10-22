import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import useSeo from '@/hooks/useSeo';

function Forbidden() {
	useSeo();

	return (
		<div className='flex min-h-[60vh] items-center justify-center bg-paper px-4'>
			<div className='text-center'>
				<p className='font-display text-6xl text-foreground'>403</p>
				<h1 className='mt-2 text-2xl font-semibold'>Access forbidden</h1>
				<p className='mt-2 text-base text-muted-foreground'>
					You do not have permission to view this page.
				</p>
				<Button asChild className='mt-6'>
					<Link to='/'>Back to home</Link>
				</Button>
			</div>
		</div>
	);
}

export default Forbidden;
