import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export function personInitials(name) {
	const parts = String(name || '')
		.trim()
		.split(/\s+/)
		.filter(Boolean);
	if (!parts.length) return '?';
	const letters =
		parts.length === 1 ? parts[0].slice(0, 2) : `${parts[0][0]}${parts[1][0]}`;
	return letters.toUpperCase();
}

export default function PersonAvatar({ name, src, className }) {
	return (
		<Avatar className={cn('size-12', className)}>
			{src ? <AvatarImage src={src} alt='' className='object-cover' /> : null}
			<AvatarFallback className='bg-brand-soft text-sm font-medium text-brand'>
				{personInitials(name)}
			</AvatarFallback>
		</Avatar>
	);
}
