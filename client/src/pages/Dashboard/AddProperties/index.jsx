import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'motion/react';
import useAuth from '@/hooks/useAuth';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import { toast } from 'react-toastify';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import useAxios from '@/hooks/useAxios';
import {
	closestCenter,
	DndContext,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortableImage from '@/components/Shared/SortableImage';
import SkeletonInput from '@/components/Shared/skeletons/SkeletonInput';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Link } from 'react-router';
import MapPicker from './MapPicker';

function AddProperties() {
	const { user } = useAuth();
	const axiosSecure = useAxiosSecure();
	const axiosInstance = useAxios();
	const [uploading, setUploading] = useState(false);
	const [imageUrls, setImageUrls] = useState([]);
	const [categories, setCategories] = useState([]);
	const [deletingIds, setDeletingIds] = useState([]);
	const [showMap, setShowMap] = useState(false);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
		watch,
		setValue,
	} = useForm();

	const handleImageUpload = async (e) => {
		const files = Array.from(e.target.files);
		const maxSizeMB = 2;

		if (files.length + imageUrls.length > 5) {
			toast.error('You can only upload up to 5 images.');
			return;
		}

		const oversized = files.find((file) => file.size > maxSizeMB * 1024 * 1024);
		if (oversized) {
			toast.error(`Image size must be under ${maxSizeMB}MB`);
			return;
		}

		setUploading(true);
		const urls = [];

		for (const file of files) {
			const formData = new FormData();
			formData.append('file', file);

			try {
				const res = await axiosInstance.post('/api/v1/upload', formData);

				urls.push({
					url: res.data.url,
					public_id: res.data.public_id,
				});
			} catch (err) {
				toast.error('Image upload failed');
				console.log(err);
			}
		}

		setImageUrls((prev) => [...prev, ...urls]);
		setUploading(false);
	};

	const onSubmit = async (data) => {
		if (!imageUrls.length)
			return toast.error('Please upload at least one image');

		const property = {
			...data,
			images: imageUrls,
			agentName: user?.displayName,
			agentEmail: user?.email,
			agentId: user?.uid,
			categories,
			verificationStatus: 'pending',
			isAdvertised: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			reviews: [],
			dealStatus: null,
			agentImage: user?.photoURL,
			coordinates: {
				lat: parseFloat(data.lat),
				lng: parseFloat(data.lng),
			},
		};

		try {
			const res = await axiosSecure.post('/properties', property);
			if (res.data.insertedId) {
				toast.success('Property added successfully');
				reset();
				setImageUrls([]);
				setCategories([]);
			}
		} catch (err) {
			toast.error('Failed to add property');
			console.log(err);
		}
	};

	const handleTagInput = (e) => {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			const tag = e.target.value.trim();
			if (tag && !categories.includes(tag)) {
				setCategories([...categories, tag]);
				e.target.value = '';
			}
		}
	};

	const removeCategory = (tag) => {
		setCategories(categories.filter((c) => c !== tag));
	};

	const sensors = useSensors(useSensor(PointerSensor));

	const handleDragEnd = (event) => {
		const { active, over } = event;
		if (active.id !== over.id) {
			const oldIndex = imageUrls.findIndex(
				(img) => img.public_id === active.id,
			);
			const newIndex = imageUrls.findIndex((img) => img.public_id === over.id);
			setImageUrls((urls) => arrayMove(urls, oldIndex, newIndex));
		}
	};

	const handleRemoveImage = async (public_id) => {
		setDeletingIds((prev) => [...prev, public_id]);
		try {
			await axiosInstance.post('/api/v1/delete-image', { public_id });
			setImageUrls((prev) => prev.filter((img) => img.public_id !== public_id));
		} catch (err) {
			toast.error('Failed to delete image');
			console.log(err);
		}
	};

	// Function to detect user's location
	const detectLocation = () => {
		if (!navigator.geolocation) {
			alert('Geolocation is not supported by your browser');
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const { latitude, longitude } = position.coords;
				setValue('lat', latitude);
				setValue('lng', longitude);
			},
			(error) => {
				alert('Unable to retrieve your location');
				console.error(error);
			},
		);
	};

	return (
		<Card className='w-full mx-auto my-10 p-6'>
			<CardHeader className='text-2xl font-bold'>Add New Property</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
					<div className='space-y-2'>
						<Label>Property Title</Label>
						<Input
							{...register('title', {
								required: 'Property title is required',
								minLength: {
									value: 5,
									message: 'Title must be at least 5 characters',
								},
							})}
						/>
						{errors.title && (
							<p className='text-red-500 text-sm'>This field is required</p>
						)}
					</div>

					<div className='space-y-2'>
						<Label>Location</Label>
						<Input {...register('location', { required: true })} />
						{errors.location && (
							<p className='text-red-500 text-sm'>This field is required</p>
						)}
					</div>

					<div className='space-y-2'>
						<Label>Upload Images</Label>

						{!uploading ? (
							<Input
								type='file'
								accept='image/*'
								multiple
								onChange={handleImageUpload}
								className='cursor-pointer'
							/>
						) : (
							<SkeletonInput />
						)}
						<DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							onDragEnd={handleDragEnd}
						>
							<SortableContext
								items={imageUrls.map((img) => img.public_id)}
								strategy={verticalListSortingStrategy}
							>
								<div className='flex gap-2 flex-wrap'>
									{imageUrls.map((img) => (
										<SortableImage
											key={img?.public_id}
											id={img?.public_id}
											url={img?.url}
											onRemove={handleRemoveImage}
											isDeleting={deletingIds.includes(img.public_id)}
										/>
									))}
								</div>
							</SortableContext>
						</DndContext>
					</div>

					<div className='space-y-2'>
						<Label>Tags/Categories</Label>
						<Input
							type='text'
							placeholder='Type and press Enter or comma'
							onKeyDown={handleTagInput}
						/>

						<div className='flex flex-wrap mt-2 gap-2'>
							{categories.map((cat, idx) => (
								<span
									key={idx}
									className='px-2 py-1 text-sm bg-slate-100 dark:bg-slate-800 rounded cursor-pointer'
									onClick={() => removeCategory(cat)}
								>
									{cat} ✕
								</span>
							))}
						</div>
					</div>

					<div className='grid grid-cols-2 gap-4 space-y-2'>
						<div className='space-y-2'>
							<Label>Min Price</Label>
							<Input
								type='number'
								{...register('minPrice', {
									required: 'Min price is required',
									min: { value: 0, message: 'Min price must be at least 0' },
								})}
							/>
							{errors.minPrice && (
								<p className='text-red-500 text-sm'>
									{errors.minPrice.message}
								</p>
							)}
						</div>
						<div className='space-y-2'>
							<Label>Max Price</Label>
							<Input
								type='number'
								{...register('maxPrice', {
									required: 'Max price is required',
									min: { value: 0, message: 'Max price must be at least 0' },
									validate: (value) =>
										Number(value) >= Number(watch('minPrice')) ||
										'Max price must be ≥ Min price',
								})}
							/>
							{errors.maxPrice && (
								<p className='text-red-500 text-sm'>
									{errors.maxPrice.message}
								</p>
							)}
						</div>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label>Bedrooms</Label>
							<Input
								type='number'
								{...register('bedrooms', {
									required: 'Number of bedrooms is required',
									min: { value: 1, message: 'Must be at least 1' },
								})}
							/>
							{errors.bedrooms && (
								<p className='text-red-500 text-sm'>
									{errors.bedrooms.message}
								</p>
							)}
						</div>
						<div className='space-y-2'>
							<Label>Bathrooms</Label>
							<Input
								type='number'
								{...register('bathrooms', {
									required: 'Number of bathrooms is required',
									min: { value: 1, message: 'Must be at least 1' },
								})}
							/>
							{errors.bathrooms && (
								<p className='text-red-500 text-sm'>
									{errors.bathrooms.message}
								</p>
							)}
						</div>
					</div>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label>Square Meters</Label>
							<Input
								type='number'
								{...register('squareMeters', {
									required: 'Area is required',
									min: {
										value: 1,
										message: 'Square meters must be at least 1',
									},
								})}
							/>
							{errors.squareMeters && (
								<p className='text-red-500 text-sm'>
									{errors.squareMeters.message}
								</p>
							)}
						</div>
						<div className='space-y-2'>
							<Label>Google Map Location</Label>
							<Input
								type='text'
								{...register('googleMap', {
									required: 'Google Maps link is required',
								})}
								placeholder='https://maps.google.com/maps?q=...'
							/>
							{errors.googleMap && (
								<p className='text-red-500 text-sm'>
									{errors.googleMap.message}
								</p>
							)}
						</div>
					</div>
					{/* For Lat and Lng */}
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label>Latitude</Label>
							<Input
								type='number'
								step='any'
								placeholder='10.7806'
								{...register('lat', { required: 'Latitude is required' })}
							/>
							{errors.lat && (
								<p className='text-red-500 text-sm'>{errors.lat.message}</p>
							)}
						</div>

						<div className='space-y-2'>
							<Label>Longitude</Label>
							<Input
								type='number'
								step='any'
								placeholder='10.4193'
								{...register('lng', { required: 'Longitude is required' })}
							/>
							{errors.lng && (
								<p className='text-red-500 text-sm'>{errors.lng.message}</p>
							)}
						</div>

						<p className='text-sm text-muted-foreground'>
							Don't know coordinates? 👉 Search your location on{' '}
							<Link
								to='https://www.latlong.net'
								target='_blank'
								rel='noopener noreferrer'
								className='text-primary underline'
							>
								latlong.net
							</Link>{' '}
							and paste the values.
						</p>
						<Button type='button' variant='outline' onClick={detectLocation}>
							Use My Current Location
						</Button>
					</div>
					<div className='space-y-2'>
						<Button type='button' onClick={() => setShowMap(!showMap)} variant='secondary'>
							{showMap ? 'Hide Map' : 'Pick Location on Map'}
						</Button>
						<AnimatePresence>
							{showMap && (
								<motion.div
									initial={{ height: 0, opacity: 0, scaleY: 0.8 }}
									animate={{ height: 'auto', opacity: 1, scaleY: 1 }}
									exit={{ height: 0, opacity: 0, scaleY: 0.8 }}
									transition={{ duration: 0.4, ease: 'easeInOut' }}
									className='overflow-hidden origin-top'
								>
									<MapPicker
										setLat={(val) => setValue('lat', val)}
										setLng={(val) => setValue('lng', val)}
									/>
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						{/* Property Type */}
						<div className='space-y-2'>
							<Label>Property Type</Label>
							<Select
								{...register('propertyType', {
									required: 'Property type is required',
								})}
								onValueChange={(val) => setValue('propertyType', val)}
							>
								<SelectTrigger className='w-full'>
									<SelectValue placeholder='Select property type' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='apartment'>Apartment</SelectItem>
									<SelectItem value='house'>House</SelectItem>
									<SelectItem value='studio'>Studio</SelectItem>
								</SelectContent>
							</Select>
							{errors.propertyType && (
								<p className='text-sm text-red-500'>
									{errors.propertyType.message}
								</p>
							)}
						</div>

						{/* Parking Available */}
						<div className='space-y-2'>
							<Label>Parking Available</Label>
							<RadioGroup
								className='flex gap-4'
								defaultValue='no'
								{...register('parking')}
								onValueChange={(val) => setValue('parking', val)}
							>
								<div className='flex items-center space-x-2'>
									<RadioGroupItem value='yes' id='yes' />
									<Label htmlFor='yes'>Yes</Label>
								</div>
								<div className='flex items-center space-x-2'>
									<RadioGroupItem value='no' id='no' />
									<Label htmlFor='no'>No</Label>
								</div>
							</RadioGroup>
						</div>
					</div>

					<div className='space-y-2'>
						<Label>Description</Label>
						<Textarea
							{...register('description', {
								required: 'Description is required',
								minLength: {
									value: 20,
									message: 'Description must be at least 20 characters',
								},
							})}
						/>
						{errors.description && (
							<p className='text-red-500 text-sm'>
								{errors.description.message}
							</p>
						)}
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label>Agent Name</Label>
							<Input
								value={user?.displayName || ''}
								readOnly
								className='bg-muted'
							/>
						</div>
						<div className='space-y-2'>
							<Label>Agent Email</Label>
							<Input value={user?.email || ''} readOnly className='bg-muted' />
						</div>
					</div>

					<Button type='submit' className='mt-4'>
						Add Property
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}

export default AddProperties;
