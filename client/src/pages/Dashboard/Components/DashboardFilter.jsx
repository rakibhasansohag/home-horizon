import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PAGE_SIZE } from '@/lib/pageList';

export const PREVIEW_LIMIT = 6;

export function usePreview(initial = 'all') {
	const [filter, setFilter] = useState(initial);
	const [visible, setVisible] = useState(PREVIEW_LIMIT);

	const choose = (next) => {
		setFilter(next);
		setVisible(PREVIEW_LIMIT);
	};

	const showMore = () => setVisible((count) => count + PREVIEW_LIMIT);

	return { filter, choose, visible, showMore };
}

export function FilterSection({ label, options, value, onChange }) {
	return (
		<section className='rounded-lg border border-border bg-surface p-4'>
			<div className='flex flex-col gap-3 lg:flex-row lg:items-center'>
			<h2 className='text-base font-semibold lg:w-28'>{label}</h2>
			<div className='grid flex-1 grid-cols-2 gap-2 lg:flex'>
				{options.map((option) => {
					const active = value === option.value;
					return (
						<button
							key={option.value}
							type='button'
							aria-pressed={active}
							onClick={() => onChange(option.value)}
							className={cn(
								'min-h-11 rounded-md border px-3 text-sm transition-colors duration-200 lg:flex-1',
								active
									? 'border-brand bg-brand text-surface'
									: 'border-border bg-surface text-foreground hover:border-brand',
							)}
						>
							{option.label}
						</button>
					);
				})}
			</div>
			</div>
		</section>
	);
}

export function ResultSummary({ label, value }) {
	return (
		<section className='rounded-lg border border-border bg-surface p-4'>
			<p className='text-sm text-muted-foreground'>{label}</p>
			<p className='mt-1 text-2xl font-semibold tabular-nums'>{value}</p>
		</section>
	);
}

export function useListControls(initial = 'all') {
	const [filter, setFilter] = useState(initial);
	const [page, setPage] = useState(1);
	const [q, setQ] = useState('');
	const [query, setQuery] = useState('');

	useEffect(() => {
		const id = setTimeout(() => setQuery(q.trim()), 300);
		return () => clearTimeout(id);
	}, [q]);

	const choose = (next) => {
		setFilter(next);
		setPage(1);
	};

	const search = (value) => {
		setQ(value);
		setPage(1);
	};

	return { filter, choose, page, setPage, q, query, search };
}

export function Pager({ page, pages, total, limit = PAGE_SIZE, onPage }) {
	useEffect(() => {
		if (pages && page > pages) onPage(pages);
	}, [page, pages, onPage]);

	if (!total) return null;
	const start = (page - 1) * limit + 1;
	const end = Math.min(page * limit, total);
	return (
		<div className='flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between'>
			<p className='text-sm text-muted-foreground'>
				Showing {start}–{end} of {total}
			</p>
			{pages > 1 ? (
				<div className='flex items-center gap-2'>
					<Button
						type='button'
						variant='outline'
						size='sm'
						disabled={page <= 1}
						onClick={() => onPage(page - 1)}
					>
						Previous
					</Button>
					<p className='min-w-16 text-center text-sm tabular-nums'>
						{page} / {pages}
					</p>
					<Button
						type='button'
						variant='outline'
						size='sm'
						disabled={page >= pages}
						onClick={() => onPage(page + 1)}
					>
						Next
					</Button>
				</div>
			) : null}
		</div>
	);
}

export function ShowMore({ shown, total, onMore }) {
	if (total <= PREVIEW_LIMIT) return null;
	return (
		<div className='flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between'>
			<p className='text-sm text-muted-foreground'>
				Showing {Math.min(shown, total)} of {total}
			</p>
			{shown < total ? (
				<Button type='button' variant='outline' onClick={onMore}>
					Show more
				</Button>
			) : null}
		</div>
	);
}
