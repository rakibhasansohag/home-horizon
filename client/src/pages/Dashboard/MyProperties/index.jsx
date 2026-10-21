import { Button } from '@/components/ui/button';
import PropertyCard from '@/components/Shared/PropertyCard';
import { Link } from 'react-router';

import useMyProperties from '@/hooks/useMyProperties';

import { useState } from 'react';
import UpdatePropertyModal from '../../../components/Shared/UpdatePropertyModal';
import ConfirmDeleteModal from '../../../components/Shared/ConfirmDeleteModal';
import { Skeleton } from '../../../components/ui/skeleton';
import { gateQuery } from '@/lib/queryWait';

export default function MyProperties() {
	const propertiesQuery = useMyProperties();
	const { data: properties, refetch } = propertiesQuery;
	const [propertyToUpdate, setPropertyToUpdate] = useState(null);
	const [propertyToDeleteId, setPropertyToDeleteId] = useState(null);
	const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

	if (gateQuery(propertiesQuery) === 'loading')
		return (
			<div className='p-4 space-y-2 max-w-full'>
				{[...Array(6)].map((_, i) => (
					<Skeleton key={i} className='h-10 rounded-md w-full' />
				))}
			</div>
		);

	if (gateQuery(propertiesQuery) === 'error') {
		return <p className='text-destructive'>Could not load your properties.</p>;
	}

	if (!properties?.length) {
		return (
			<p className='text-base text-muted-foreground'>
				No properties yet.{' '}
				<Link to='/dashboard/add-property' className='font-medium text-brand hover:underline'>
					Add a property
				</Link>
			</p>
		);
	}

	const handleDelete = (id) => {
		setPropertyToDeleteId(id);
		setIsDeleteModalOpen(true);
	};

	const handleUpdate = (property) => {
		setPropertyToUpdate(property);
		setIsUpdateModalOpen(true);
	};

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 px-2'>
			{properties.map((property) => {
				const isRejected = property.verificationStatus === 'rejected';

				return (
					<div key={property._id}>
						<PropertyCard property={property}>
							<p className='text-base text-muted-foreground'>
								{property.bedrooms} bed · {property.bathrooms} bath ·{' '}
								{property.squareMeters} sq ft · Parking: {property.parking}
							</p>
							<div className='flex flex-wrap gap-2'>
								<Button asChild>
									<Link to={`/all-properties/${property._id}`}>
										View Details
									</Link>
								</Button>
								{!isRejected && (
									<Button
										variant='outline'
										onClick={() => handleUpdate(property)}
									>
										Update
									</Button>
								)}
								<Button
									variant='destructive'
									onClick={() =>
										handleDelete(property._id?.$oid || property._id)
									}
								>
									Delete
								</Button>
							</div>
						</PropertyCard>
					</div>
				);
			})}

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
