import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

export default function EmptyProperties() {
	const navigate = useNavigate();
	return (
		<div className='mx-auto flex min-h-[50vh] w-full flex-col items-center justify-center gap-4 px-4 text-center'>
			<FileQuestion className='h-14 w-14 text-muted-foreground' />
			<h2 className='text-lg font-semibold text-muted-foreground'>
				No Properties Found
			</h2>
			<p className='text-sm text-muted-foreground'>
				We couldn’t find any property matching your filters or search.
			</p>

			<Button variant='outline' asChild>
				<Link to='/dashboard/add-property' onClick={() => navigate(-1)}>
					Go Back
				</Link>
			</Button>

			<Button variant='outline' asChild>
				<Link to='/dashboard/add-property'>Add Your First Property</Link>
			</Button>
		</div>
	);
}
