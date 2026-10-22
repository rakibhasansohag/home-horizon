import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { amenitiesByGroup, listedAmenities } from '@/lib/amenities';

const PREVIEW = 8;

export default function Amenities({ ids }) {
	const items = listedAmenities(ids);
	const [open, setOpen] = useState(false);
	if (!items.length) return null;

	const preview = items.slice(0, PREVIEW);

	return (
		<section className='space-y-4'>
			<h2 className='text-xl font-semibold'>What this home offers</h2>
			<ul className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
				{preview.map((item) => (
					<AmenityLine key={item.id} item={item} />
				))}
			</ul>
			{items.length > PREVIEW ? (
				<Button type='button' variant='outline' onClick={() => setOpen(true)}>
					Show all {items.length} amenities
				</Button>
			) : null}
			<AmenityDialog
				open={open}
				onOpenChange={setOpen}
				ids={ids}
				total={items.length}
			/>
		</section>
	);
}

function AmenityDialog({ open, onOpenChange, ids, total }) {
	const [query, setQuery] = useState('');
	const groups = useMemo(() => {
		const needle = query.trim().toLowerCase();
		return amenitiesByGroup(ids)
			.map((group) => ({
				...group,
				items: needle
					? group.items.filter((item) =>
							item.label.toLowerCase().includes(needle),
						)
					: group.items,
			}))
			.filter((group) => group.items.length > 0);
	}, [ids, query]);

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				onOpenChange(next);
				if (!next) setQuery('');
			}}
		>
			<DialogContent className='max-h-[min(40rem,calc(100dvh-2rem))] overflow-y-auto sm:max-w-2xl'>
				<DialogHeader>
					<DialogTitle>What this home offers</DialogTitle>
					<p className='text-sm text-muted-foreground'>{total} amenities</p>
				</DialogHeader>
				<Input
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					placeholder='Search amenities'
					aria-label='Search amenities'
				/>
				<div className='space-y-5'>
					{groups.length === 0 ? (
						<p className='text-sm text-muted-foreground'>
							No amenities match that search.
						</p>
					) : (
						groups.map((group) => (
							<section key={group.id} className='space-y-2'>
								<h3 className='text-sm font-medium text-muted-foreground'>
									{group.label}
								</h3>
								<ul className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
									{group.items.map((item) => (
										<AmenityLine key={item.id} item={item} />
									))}
								</ul>
							</section>
						))
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

function AmenityLine({ item }) {
	const Icon = item.icon;
	return (
		<li className='flex min-h-11 items-center gap-3 text-base'>
			<Icon className='size-5 shrink-0 text-brand' aria-hidden='true' />
			<span>{item.label}</span>
		</li>
	);
}
