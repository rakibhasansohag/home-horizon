import { useState } from 'react';
import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import useAuth from '@/hooks/useAuth';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import PersonAvatar from '@/components/Shared/PersonAvatar';
import { formatMoney } from '@/components/Shared/PropertyCard';
import { gateQuery } from '@/lib/queryWait';
import { listParams, viewList } from '@/lib/pageList';
import { Pager, useListControls } from '@/pages/Dashboard/Components/DashboardFilter';

export default function MyWishlist() {
	const axiosSecure = useAxiosSecure();
	const { user } = useAuth();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { page, setPage, q, query, search } = useListControls();

	const wishlistQuery = useQuery({
		queryKey: ['user-wishlist', user?.uid, page, query],
		placeholderData: keepPreviousData,
		queryFn: async () => {
			const res = await axiosSecure.get('/wishlist', {
				params: { userId: user?.uid, ...listParams({ page, query }) },
			});
			return res.data;
		},
		enabled: !!user?.uid,
	});
	const view = viewList(wishlistQuery.data, page, (items) =>
		matchHome(items, query),
	);
	const wishlist = view?.items || [];

	const { mutate: removeFromWishlist, isLoading: removing } = useMutation({
		mutationFn: async (propertyId) => {
			await axiosSecure.delete(
				`/wishlist?userId=${user?.uid}&propertyId=${propertyId}`,
			);
		},
		onSuccess: () => {
			toast.success('Removed from wishlist');
			queryClient.invalidateQueries({ queryKey: ['user-wishlist', user?.uid] });
		},
		onError: () => {
			toast.error('Failed to remove');
		},
	});

	if (gateQuery(wishlistQuery) === 'loading') return <HomeSkeleton />;

	if (gateQuery(wishlistQuery) === 'error') {
		return <p className='text-destructive'>Could not load your wishlist.</p>;
	}

	return (
		<div className='w-full space-y-6'>
			<Input
				value={q}
				aria-label='Find a saved home'
				placeholder='Search by home or location'
				onChange={(event) => search(event.target.value)}
			/>
			{!view?.total ? (
				<p className='text-base text-muted-foreground'>
					{query ? (
						'No saved homes match.'
					) : (
						<>
							Your wishlist is empty.{' '}
							<Link to='/all-properties' className='font-medium text-brand'>
								Browse properties
							</Link>
						</>
					)}
				</p>
			) : (
				<>
					<ul className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
						{wishlist.map((item) => (
							<WishlistRow
								key={item._id || item.propertyId}
								item={item}
								onOffer={() =>
									navigate(
										`/dashboard/offer/${item.property?._id || item.propertyId}`,
									)
								}
								onRemove={() => removeFromWishlist(item.propertyId)}
								removing={removing}
							/>
						))}
					</ul>
					<Pager
						page={page}
						pages={view.pages}
						total={view.total}
						limit={view.limit}
						onPage={setPage}
					/>
				</>
			)}
		</div>
	);
}

function matchHome(items, query) {
	const term = String(query || '').trim().toLowerCase();
	if (!term) return items;
	return items.filter((item) =>
		`${item.property?.title || item.propertyTitle || ''} ${item.property?.location || item.propertyLocation || ''}`
			.toLowerCase()
			.includes(term),
	);
}

function WishlistRow({ item, onOffer, onRemove, removing }) {
	const home = item.property;
	const title = home?.title || 'This listing is no longer available';
	const price = home
		? `${formatMoney(home.minPrice)}${
				home.maxPrice != null && String(home.maxPrice) !== String(home.minPrice)
					? ` – ${formatMoney(home.maxPrice)}`
					: ''
			}`
		: '';

	return (
		<li className='flex min-h-44 overflow-hidden rounded-lg border border-border bg-surface'>
			{home?.image && item.propertyId ? (
				<Link
					to={`/all-properties/${item.propertyId}`}
					className='relative w-2/5 max-w-72 shrink-0 bg-muted'
				>
					<FillPhoto src={home.image} alt={title} />
				</Link>
			) : null}
			<div className='flex min-w-0 flex-1 flex-col gap-1 p-4'>
				{item.propertyId ? (
					<Link
						to={`/all-properties/${item.propertyId}`}
						className='line-clamp-2 font-medium leading-snug transition-colors duration-200 hover:text-brand'
					>
						{title}
					</Link>
				) : (
					<p className='font-medium'>{title}</p>
				)}
				{home?.location ? (
					<p className='truncate text-sm text-muted-foreground'>{home.location}</p>
				) : null}
				{price ? <p className='text-base font-medium tabular-nums'>{price}</p> : null}
				<div className='mt-auto flex flex-wrap items-center justify-between gap-2 pt-3'>
					{home?.agentName ? (
						<div className='flex min-w-0 items-center gap-2'>
							<PersonAvatar
								name={home.agentName}
								src={home.agentImage}
								className='size-8'
							/>
							<p className='truncate text-sm'>{home.agentName}</p>
						</div>
					) : (
						<span />
					)}
					<div className='flex flex-wrap gap-2'>
						{item.propertyId ? (
							<Button size='sm' variant='accent' onClick={onOffer}>
								Make offer
							</Button>
						) : null}
						<Button
							size='sm'
							variant='ghost'
							className='text-destructive'
							onClick={onRemove}
							disabled={removing}
						>
							Remove
						</Button>
					</div>
				</div>
			</div>
		</li>
	);
}

function FillPhoto({ src, alt }) {
	const [failed, setFailed] = useState(false);
	if (!src || failed) return null;
	return (
		<img
			src={src}
			alt={alt || ''}
			className='absolute inset-0 h-full w-full object-cover'
			onError={() => setFailed(true)}
		/>
	);
}

function HomeSkeleton() {
	return (
		<div className='grid grid-cols-1 gap-4 xl:grid-cols-2' aria-busy='true'>
			<span className='sr-only'>Loading wishlist</span>
			{Array.from({ length: 4 }, (_, index) => (
				<div
					key={index}
					className='flex min-h-44 overflow-hidden rounded-lg border border-border bg-surface'
				>
					<Skeleton className='w-2/5 max-w-72 rounded-none' />
					<div className='flex-1 space-y-2 p-4'>
						<Skeleton className='h-4 w-3/4' />
						<Skeleton className='h-3 w-1/2' />
						<Skeleton className='h-4 w-2/3' />
					</div>
				</div>
			))}
		</div>
	);
}
