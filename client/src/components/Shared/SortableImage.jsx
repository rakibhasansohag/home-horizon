import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'motion/react';

export default function SortableImage({ id, url, onRemove, isDeleting }) {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<AnimatePresence>
			{!isDeleting && (
				<motion.div
					ref={setNodeRef}
					style={style}
					{...attributes}
					{...listeners}
					initial={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.95, y: -10 }}
					transition={{ duration: 0.3 }}
					className='relative'
				>
					<img
						src={url}
						alt='Preview'
						className='w-20 h-20 object-cover rounded border'
					/>
					<button
						type='button'
						onClick={() => onRemove(id)}
						onPointerDown={(e) => e.stopPropagation()}
						className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center z-10'
					>
						<X />
					</button>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
