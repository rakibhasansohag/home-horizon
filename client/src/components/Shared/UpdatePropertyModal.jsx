import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Bed, Bath, Ruler, MapPin, Tag, X } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import { toast } from 'react-toastify';

export default function UpdatePropertyModal({
	isOpen,
	onClose,
	property,
	refetch,
}) {
	const { user } = useAuth();
	const axiosSecure = useAxiosSecure();

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		control,
		watch,
	} = useForm({
		defaultValues: property || {
			title: '',
			location: '',
			minPrice: '',
			maxPrice: '',
			bedrooms: '',
			bathrooms: '',
			squareMeters: '',
			googleMap: '',
			description: '',
			categories: [],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'categories',
	});

	useEffect(() => {
		if (property) {
			reset({
				...property,
				categories: property.categories || [],
			});
		}
	}, [property, reset]);

	const mutation = useMutation({
		mutationFn: async (data) => {
			return await axiosSecure.put(`/properties/${property._id}`, data);
		},
		onSuccess: () => {
			toast.success('Property updated successfully');
			refetch();
			onClose();
		},
		onError: (error) => {
			console.error('Update error:', error);
			toast.error('Failed to update property');
		},
	});

	const onSubmit = (data) => {
		mutation.mutate(data);
	};

	const handleAddCategory = (e) => {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			const newCategory = e.target.value.trim();
			if (newCategory && !fields.some((field) => field.value === newCategory)) {
				append({ value: newCategory });
				e.target.value = '';
			}
		}
	};

	const handleRemoveCategory = (index) => {
		remove(index);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='!max-w-3xl overflow-y-auto max-h-[90vh]'>
				<DialogHeader>
					<DialogTitle>Update Property</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label>
								<MapPin className='w-4 h-4 mr-1 inline' /> Property Title
							</Label>
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
								<p className='text-red-500 text-sm'>{errors.title.message}</p>
							)}
						</div>

						<div className='space-y-2'>
							<Label>
								<MapPin className='w-4 h-4 mr-1 inline' /> Location
							</Label>
							<Input
								{...register('location', { required: 'Location is required' })}
							/>
							{errors.location && (
								<p className='text-red-500 text-sm'>
									{errors.location.message}
								</p>
							)}
						</div>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label>Min Price (BDT)</Label>
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
							<Label>Max Price (BDT)</Label>
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
							<Label>
								<Bed className='w-4 h-4 mr-1 inline' /> Bedrooms
							</Label>
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
							<Label>
								<Bath className='w-4 h-4 mr-1 inline' /> Bathrooms
							</Label>
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
							<Label>
								<Ruler className='w-4 h-4 mr-1 inline' /> Square Meters
							</Label>
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
							<Label>
								<MapPin className='w-4 h-4 mr-1 inline' /> Google Map Location
							</Label>
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

					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label>
								<Tag className='w-4 h-4 mr-1 inline' /> Description
							</Label>
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

						<div className='space-y-2'>
							<Label>
								<Tag className='w-4 h-4 mr-1 inline' /> Categories
							</Label>
							<Input
								type='text'
								placeholder='Type and press Enter or comma'
								onKeyDown={handleAddCategory}
							/>
							<div className='flex flex-wrap gap-2 mt-2'>
								{fields.map((field, index) => (
									<span
										key={field.id}
										className='px-2 py-1 text-sm bg-slate-100 dark:bg-slate-800 rounded cursor-pointer flex justify-center items-center'
										onClick={() => handleRemoveCategory(index)}
									>
										{field.value} <X />
									</span>
								))}
							</div>
						</div>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label>Agent Name</Label>
							<Input
								value={user?.displayName || property?.agentName || ''}
								readOnly
								className='bg-muted'
							/>
						</div>
						<div className='space-y-2'>
							<Label>Agent Email</Label>
							<Input
								value={user?.email || property?.agentEmail || ''}
								readOnly
								className='bg-muted'
							/>
						</div>
					</div>

					<DialogFooter>
						<Button type='submit' disabled={mutation.isLoading}>
							{mutation.isLoading ? 'Updating...' : 'Save Changes'}
						</Button>
						<Button variant='outline' onClick={onClose}>
							Cancel
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
