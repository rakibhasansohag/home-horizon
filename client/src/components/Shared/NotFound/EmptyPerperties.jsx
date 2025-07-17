// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

export default function EmptyProperties() {
	const navigate = useNavigate();
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.3 }}
			className='!w-full mx-auto min-h-screen flex flex-col items-center justify-center gap-4 text-center transform duration-300 ease-in-out'
		>
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
		</motion.div>
	);
}
