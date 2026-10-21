import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }) {
	return (
		<input
			type={type}
			data-slot='input'
			className={cn(
				'file:text-foreground placeholder:text-ink-muted selection:bg-brand selection:text-surface border-input flex h-11 min-h-11 w-full min-w-0 rounded-md border bg-surface px-3 text-base outline-none transition-colors duration-200 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
				'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
				'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
