import * as React from 'react';

import { cn } from '@/lib/utils';

function Textarea({ className, ...props }) {
	return (
		<textarea
			data-slot='textarea'
			className={cn(
				'border-input placeholder:text-ink-muted focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-24 w-full rounded-md border bg-surface px-3 py-3 text-base outline-none transition-colors duration-200 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
