// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';

export default function NotFoundPage() {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
			className='min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-12'
		>
			<h1 className='text-7xl font-bold text-destructive/90 dark:text-destructive mb-4'>
				404
			</h1>
			<p className='text-xl font-semibold mb-2 text-muted-foreground'>
				Oops! Page not found
			</p>
			<p className='text-sm mb-6 max-w-md text-muted-foreground'>
				The page you are looking for doesn't exist or has been moved.
			</p>

			<Button asChild>
				<Link to='/'>Back to Home</Link>
			</Button>
		</motion.div>
	);
}
