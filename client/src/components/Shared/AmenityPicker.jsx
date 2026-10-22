import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AMENITY_GROUPS } from '@/lib/amenities';

export default function AmenityPicker({ value = [], onChange }) {
	const [query, setQuery] = useState('');
	const selected = useMemo(() => new Set(value), [value]);
	const needle = query.trim().toLowerCase();

	const groups = AMENITY_GROUPS.map((group) => ({
		...group,
		items: needle
			? group.items.filter((item) => item.label.toLowerCase().includes(needle))
			: group.items,
	})).filter((group) => group.items.length > 0);

	const toggle = (id) => {
		if (selected.has(id)) onChange(value.filter((item) => item !== id));
		else onChange([...value, id]);
	};

	return (
		<div className='space-y-4'>
			<div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
				<div>
					<p className='text-base font-medium'>What this home offers</p>
					<p className='text-sm text-muted-foreground'>
						{value.length} selected
					</p>
				</div>
				<Input
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === 'Enter') event.preventDefault();
					}}
					placeholder='Search amenities'
					className='sm:max-w-64'
					aria-label='Search amenities'
				/>
			</div>
			{groups.length === 0 ? (
				<p className='text-sm text-muted-foreground'>
					No amenities match that search.
				</p>
			) : (
				<div className='space-y-5'>
					{groups.map((group) => (
						<section key={group.id} className='space-y-2'>
							<h3 className='text-sm font-medium text-muted-foreground'>
								{group.label}
							</h3>
							<div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
								{group.items.map((item) => {
									const on = selected.has(item.id);
									const Icon = item.icon;
									return (
										<button
											key={item.id}
											type='button'
											aria-pressed={on}
											onClick={() => toggle(item.id)}
											className={cn(
												'flex min-h-11 items-center gap-3 rounded-md border px-3 text-left text-sm transition-colors duration-200',
												on
													? 'border-brand bg-brand-soft text-brand'
													: 'border-border bg-surface text-foreground hover:border-brand',
											)}
										>
											<Icon className='size-4 shrink-0' aria-hidden='true' />
											<span>{item.label}</span>
										</button>
									);
								})}
							</div>
						</section>
					))}
				</div>
			)}
		</div>
	);
}
