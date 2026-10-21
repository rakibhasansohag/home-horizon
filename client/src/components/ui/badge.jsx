import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
	'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-sm font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-colors duration-200 overflow-hidden',
	{
		variants: {
			variant: {
				default: 'border-transparent bg-primary text-primary-foreground',
				secondary: 'border-transparent bg-muted text-foreground',
				outline: 'border-border text-foreground',
				success: 'border-transparent bg-success-soft text-success',
				warning: 'border-transparent bg-warning-soft text-warning',
				danger: 'border-transparent bg-danger-soft text-danger',
				destructive: 'border-transparent bg-danger-soft text-danger',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);

function Badge({ className, variant, asChild = false, ...props }) {
	const Comp = asChild ? Slot : 'span';

	return (
		<Comp
			data-slot='badge'
			className={cn(badgeVariants({ variant }), className)}
			{...props}
		/>
	);
}

export { Badge, badgeVariants };
