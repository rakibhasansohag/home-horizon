import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X } from 'lucide-react';

export default function SortableImage({ id, url, onRemove, isDeleting }) {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	if (isDeleting) return null;

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className='relative'
		>
			<img
				src={url}
				alt='Preview'
				className='h-20 w-20 rounded border object-cover'
			/>
			<button
				type='button'
				onClick={() => onRemove(id)}
				onPointerDown={(e) => e.stopPropagation()}
				className='absolute -top-2 -right-2 z-10 flex size-6 items-center justify-center rounded-full bg-danger-fill text-surface'
			>
				<X aria-hidden='true' />
			</button>
		</div>
	);
}
