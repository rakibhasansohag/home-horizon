import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatMoney } from '@/components/Shared/PropertyCard';
import { gateQuery } from '@/lib/queryWait';
import { cn } from '@/lib/utils';
import useMyProperties from '@/hooks/useMyProperties';
import UpdatePropertyModal from '../../../components/Shared/UpdatePropertyModal';
import ConfirmDeleteModal from '../../../components/Shared/ConfirmDeleteModal';
import { viewList } from '@/lib/pageList';
import {
	FilterSection,
	Pager,
	useListControls,
} from '@/pages/Dashboard/Components/DashboardFilter';

const STATUS_TONE = {
	verified: 'text-brand',
	pending: 'text-warning',
	rejected: 'text-destructive',
};

export default function MyProperties() {
	const { filter, choose, page, setPage } = useListControls('all');
	const propertiesQuery = useMyProperties({ page, filter });
	const { refetch } = propertiesQuery;
	const view = viewList(propertiesQuery.data, page, (items) =>
		filter === 'all'
			? items
			: items.filter((property) => property.verificationStatus === filter),
	);
	const rows = view?.items || [];
	const [propertyToUpdate, setPropertyToUpdate] = useState(null);
	const [propertyToDeleteId, setPropertyToDeleteId] = useState(null);
	const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const gate = gateQuery(propertiesQuery);

	const handleDelete = (id) => {
		setPropertyToDeleteId(id);
		setIsDeleteModalOpen(true);
	};

	const handleUpdate = (property) => {
		setPropertyToUpdate(property);
		setIsUpdateModalOpen(true);
	};

	return (
		<div className='w-full space-y-6'>
			<FilterSection
				label='Status'
				value={filter}
				onChange={choose}
				options={[
					{ value: 'all', label: 'All' },
					{ value: 'pending', label: 'Pending' },
					{ value: 'verified', label: 'Verified' },
					{ value: 'rejected', label: 'Rejected' },
				]}
			/>
			{gate === 'error' ? (
				<p className='text-destructive'>Could not load your properties.</p>
			) : gate === 'loading' ? (
				<HomeSkeleton />
			) : !view?.total && filter === 'all' ? (
				<p className='text-base text-muted-foreground'>
					No properties yet.{' '}
					<Link to='/dashboard/add-property' className='font-medium text-brand'>
						Add a property
					</Link>
				</p>
			) : (
				<>
					{!view?.total ? (
						<p className='text-base text-muted-foreground'>
							No properties in this status.
						</p>
					) : (
						<div className='space-y-6'>
							<ul className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
								{rows.map((property) => (
									<PropertyRow
										key={property._id}
										property={property}
										onUpdate={() => handleUpdate(property)}
										onDelete={() =>
											handleDelete(property._id?.$oid || property._id)
										}
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
						</div>
					)}
				</>
			)}
			<UpdatePropertyModal
				isOpen={isUpdateModalOpen}
				onClose={() => setIsUpdateModalOpen(false)}
				property={propertyToUpdate}
				refetch={refetch}
			/>
			<ConfirmDeleteModal
				isOpen={isDeleteModalOpen}
				propertyId={propertyToDeleteId}
				onClose={() => {
					setIsDeleteModalOpen(false);
					setPropertyToDeleteId(null);
				}}
			/>
		</div>
	);
}

function PropertyRow({ property, onUpdate, onDelete }) {
	const rejected = property.verificationStatus === 'rejected';
	const price = `${formatMoney(property.minPrice)}${
		property.maxPrice != null &&
		String(property.maxPrice) !== String(property.minPrice)
			? ` – ${formatMoney(property.maxPrice)}`
			: ''
	}`;
	const facts = [
		property.bedrooms != null ? `${property.bedrooms} bed` : '',
		property.bathrooms != null ? `${property.bathrooms} bath` : '',
		property.squareMeters != null ? `${property.squareMeters} sq ft` : '',
		property.parking != null && property.parking !== ''
			? `Parking: ${property.parking}`
			: '',
	]
		.filter(Boolean)
		.join(' · ');

	return (
		<li className='flex min-h-44 overflow-hidden rounded-lg border border-border bg-surface'>
			<Link
				to={`/all-properties/${property._id}`}
				className='relative w-2/5 max-w-72 shrink-0 bg-muted'
			>
				<FillPhoto src={property.images?.[0]?.url} alt={property.title} />
			</Link>
			<div className='flex min-w-0 flex-1 flex-col gap-1 p-4'>
				<div className='flex items-start justify-between gap-3'>
					<Link
						to={`/all-properties/${property._id}`}
						className='line-clamp-2 font-medium leading-snug transition-colors duration-200 hover:text-brand'
					>
						{property.title}
					</Link>
					<p
						className={cn(
							'shrink-0 text-sm capitalize',
							STATUS_TONE[property.verificationStatus] ||
								'text-muted-foreground',
						)}
					>
						{property.verificationStatus}
					</p>
				</div>
				{property.location ? (
					<p className='truncate text-sm text-muted-foreground'>
						{property.location}
					</p>
				) : null}
				<p className='text-base font-medium tabular-nums'>{price}</p>
				{facts ? (
					<p className='text-sm text-muted-foreground'>{facts}</p>
				) : null}
				<div className='mt-auto flex flex-wrap gap-2 pt-3'>
					<Button size='sm' variant='outline' asChild>
						<Link to={`/all-properties/${property._id}`}>View</Link>
					</Button>
					{rejected ? null : (
						<Button size='sm' variant='outline' onClick={onUpdate}>
							Update
						</Button>
					)}
					<Button
						size='sm'
						variant='ghost'
						className='text-destructive'
						onClick={onDelete}
					>
						Delete
					</Button>
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
			<span className='sr-only'>Loading properties</span>
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
