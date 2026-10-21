import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
	'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-base font-medium transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/90',
				accent: 'bg-brand text-surface hover:bg-brand/90',
				destructive:
					'bg-destructive text-surface hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
				outline:
					'border border-border bg-surface text-foreground hover:bg-brand-soft hover:text-brand',
				secondary:
					'bg-secondary text-secondary-foreground hover:bg-secondary/80',
				ghost: 'hover:bg-brand-soft hover:text-brand',
				link: 'text-brand underline-offset-4 hover:underline',
				rounded:
					'border border-brand bg-transparent text-brand hover:bg-brand-soft',
			},
			size: {
				default: 'min-h-11 h-11 px-4',
				sm: 'min-h-11 h-11 px-3 text-sm',
				lg: 'min-h-11 h-11 px-6',
				icon: 'size-11',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

function Button({ className, variant, size, asChild = false, ...props }) {
	const Comp = asChild ? Slot : 'button';

	return (
		<Comp
			data-slot='button'
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
