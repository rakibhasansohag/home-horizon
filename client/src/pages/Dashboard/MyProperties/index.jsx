import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Link } from 'react-router';

import useMyProperties from '@/hooks/useMyProperties';
import { Bed, Bath, Ruler, Car } from 'lucide-react';

import { useState } from 'react';
import UpdatePropertyModal from '../../../components/Shared/UpdatePropertyModal';
import ConfirmDeleteModal from '../../../components/Shared/ConfirmDeleteModal';
import { Skeleton } from '../../../components/ui/skeleton';

export default function MyProperties() {
	const { data: properties, isLoading, refetch } = useMyProperties();
	const [propertyToUpdate, setPropertyToUpdate] = useState(null);
	const [propertyToDeleteId, setPropertyToDeleteId] = useState(null);
	const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

	if (isLoading)
		return (
			<div className='p-4 space-y-2 max-w-full'>
				{[...Array(6)].map((_, i) => (
					<Skeleton key={i} className='h-10 rounded-md w-full' />
				))}
			</div>
		);

	if (!properties?.length) {
		return (
			<p className='text-center text-muted-foreground mt-10'>
				No properties found.
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
				const isVerified = property.verificationStatus === 'verified';
				const isRejected = property.verificationStatus === 'rejected';

				return (
					<motion.div
						key={property._id}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
					>
						<Card
							className={`border pt-0 w-full rounded-t-2xl ${
								isVerified ? 'border-green-500' : 'border-border'
							}`}
						>
							<img
								src={
									property.images[0]?.url || 'https://via.placeholder.com/300'
								}
								alt={property.title}
								className='h-56 w-full object-cover rounded-t-2xl'
							/>
							<CardContent className='p-4 pt-0 space-y-2'>
								<h2 className='font-semibold text-lg'>{property.title}</h2>
								<p className='text-sm text-muted-foreground'>
									Location: <strong>{property.location}</strong>
								</p>
								<div className='text-sm flex items-center'>
									<img
										src={
											property.agentImage || 'https://via.placeholder.com/40'
										}
										alt={property.agentName}
										className='h-10 w-10 rounded-full mr-2'
									/>
									Agent: <strong>{property.agentName}</strong>
								</div>
								<div className='text-xs'>
									Status:{' '}
									<span
										className={`px-2 py-1 rounded text-white ${
											isVerified
												? 'bg-green-500'
												: isRejected
												? 'bg-red-500'
												: 'bg-yellow-500'
										}`}
									>
										{property.verificationStatus || 'pending'}
									</span>
								</div>
								<div className='text-sm flex items-center'>
									Price: {property.minPrice} - {property.maxPrice} BDT
								</div>
								<div className='text-sm flex items-center'>
									<Bed className='w-4 h-4 mr-1 text-muted-foreground' />
									{property.bedrooms} bed |{' '}
									<Bath className='w-4 h-4 mr-1 text-muted-foreground' />
									{property.bathrooms} bath
								</div>
								<div className='text-sm flex items-center'>
									<Ruler className='w-4 h-4 mr-1 text-muted-foreground' />
									{property.squareMeters} sq feet |{' '}
									<Car className='w-4 h-4 mr-1 text-muted-foreground' />
									Parking: {property.parking}
								</div>
								<div className='flex gap-2 mt-4'>
									<Button>
										<Link to={`/all-properties/${property._id}`}>
											View Details
										</Link>
									</Button>
									{!isRejected && (
										<Button
											variant='outline'
											size='sm'
											onClick={() => handleUpdate(property)}
										>
											Update
										</Button>
									)}
									<Button
										variant='destructive'
										size='sm'
										onClick={() =>
											handleDelete(property._id?.$oid || property._id)
										}
									>
										Delete
									</Button>
								</div>
							</CardContent>
						</Card>
					</motion.div>
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
