import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import AmenityPicker from '@/components/Shared/AmenityPicker';
import ListingSteps from '@/components/Shared/ListingSteps';
import useAuth from '@/hooks/useAuth';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import { toast } from 'react-toastify';

function categoryObjects(categories) {
	return (Array.isArray(categories) ? categories : [])
		.map((item) => (typeof item === 'string' ? item : item?.value))
		.filter((item) => typeof item === 'string' && item.trim())
		.map((value) => ({ value: value.trim() }));
}

export default function UpdatePropertyModal({
	isOpen,
	onClose,
	property,
	refetch,
}) {
	const { user } = useAuth();
	const axiosSecure = useAxiosSecure();
	const [amenities, setAmenities] = useState([]);
	const [step, setStep] = useState(0);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		control,
		watch,
		trigger,
	} = useForm({
		shouldUnregister: false,
		defaultValues: {
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
				title: property.title || '',
				location: property.location || '',
				minPrice: property.minPrice ?? '',
				maxPrice: property.maxPrice ?? '',
				bedrooms: property.bedrooms ?? '',
				bathrooms: property.bathrooms ?? '',
				squareMeters: property.squareMeters ?? '',
				googleMap: property.googleMap || '',
				description: property.description || '',
				categories: categoryObjects(property.categories),
			});
			setAmenities(Array.isArray(property.amenities) ? property.amenities : []);
			setStep(0);
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
		mutation.mutate({
			title: data.title,
			location: data.location,
			minPrice: data.minPrice,
			maxPrice: data.maxPrice,
			bedrooms: data.bedrooms,
			bathrooms: data.bathrooms,
			squareMeters: data.squareMeters,
			googleMap: data.googleMap,
			description: data.description,
			categories: categoryObjects(data.categories).map((item) => item.value),
			amenities,
		});
	};

	const goNext = async () => {
		const fields = [
			['title', 'location', 'description'],
			[
				'minPrice',
				'maxPrice',
				'bedrooms',
				'bathrooms',
				'squareMeters',
				'googleMap',
			],
		][step];
		if (fields) {
			const ok = await trigger(fields);
			if (!ok) return;
		}
		setStep((current) => Math.min(current + 1, 2));
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

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='!max-w-3xl overflow-y-auto max-h-[90vh]'>
				<DialogHeader>
					<DialogTitle>Update Property</DialogTitle>
				</DialogHeader>
				<ListingSteps
					steps={['Home', 'Price', 'Offers']}
					step={step}
					onStep={setStep}
				/>

				<form
					onSubmit={(event) => {
						if (step < 2) {
							event.preventDefault();
							goNext();
							return;
						}
						handleSubmit(onSubmit)(event);
					}}
					className='space-y-4'
				>
					{step === 0 && (
						<div className='space-y-4'>
							<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
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
										<p className='text-sm text-destructive'>
											{errors.title.message}
										</p>
									)}
								</div>
								<div className='space-y-2'>
									<Label>Location</Label>
									<Input
										{...register('location', {
											required: 'Location is required',
										})}
									/>
									{errors.location && (
										<p className='text-sm text-destructive'>
											{errors.location.message}
										</p>
									)}
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
									<p className='text-sm text-destructive'>
										{errors.description.message}
									</p>
								)}
							</div>
						</div>
					)}

					{step === 1 && (
						<div className='space-y-4'>
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
										<p className='text-sm text-destructive'>
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
										<p className='text-sm text-destructive'>
											{errors.maxPrice.message}
										</p>
									)}
								</div>
							</div>
							<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
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
										<p className='text-sm text-destructive'>
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
										<p className='text-sm text-destructive'>
											{errors.bathrooms.message}
										</p>
									)}
								</div>
							</div>
							<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
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
										<p className='text-sm text-destructive'>
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
										<p className='text-sm text-destructive'>
											{errors.googleMap.message}
										</p>
									)}
								</div>
							</div>
						</div>
					)}

					{step === 2 && (
						<div className='space-y-4'>
							<div className='space-y-2'>
								<Label>Categories</Label>
								<Input
									type='text'
									placeholder='Type and press Enter or comma'
									onKeyDown={handleAddCategory}
								/>
								<div className='mt-2 flex flex-wrap gap-2'>
									{fields.map((field, index) => (
										<button
											key={field.id}
											type='button'
											className='flex items-center rounded-md bg-muted px-2 py-1 text-sm'
											onClick={() => remove(index)}
										>
											{field.value} <X className='size-4' />
										</button>
									))}
								</div>
							</div>
							<AmenityPicker value={amenities} onChange={setAmenities} />
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
						</div>
					)}

					<div className='flex items-center justify-between gap-3'>
						<Button
							type='button'
							variant='outline'
							onClick={() => setStep((current) => Math.max(current - 1, 0))}
							disabled={step === 0 || mutation.isPending}
						>
							Back
						</Button>
						<div className='flex gap-2'>
							<Button
								type='button'
								variant='ghost'
								onClick={onClose}
								disabled={mutation.isPending}
							>
								Cancel
							</Button>
							{step < 2 ? (
								<Button type='button' onClick={goNext}>
									Next
								</Button>
							) : (
								<Button type='submit' disabled={mutation.isPending}>
									{mutation.isPending ? 'Saving...' : 'Save Changes'}
								</Button>
							)}
						</div>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
