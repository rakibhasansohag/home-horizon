import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { updateProfile } from 'firebase/auth';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import PersonAvatar from '@/components/Shared/PersonAvatar';
import useAuth from '@/hooks/useAuth';
import useAxios from '@/hooks/useAxios';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import useUserProfile from '@/hooks/useUserProfile';
import { auth } from '@/firebaes/firebase.init';
import { gateQuery } from '@/lib/queryWait';
import { cn } from '@/lib/utils';

const fields = [
	{ name: 'name', label: 'Name', wide: true },
	{ name: 'phoneNumber', label: 'Phone' },
	{ name: 'location', label: 'Location' },
	{ name: 'address', label: 'Address', wide: true },
	{ name: 'gender', label: 'Gender' },
	{ name: 'age', label: 'Age' },
	{ name: 'bloodGroup', label: 'Blood group', wide: true },
];

export default function EditProfile() {
	const profileQuery = useUserProfile();
	const gate = gateQuery(profileQuery);

	if (gate === 'loading') return <ProfileFormSkeleton />;
	if (gate === 'error') {
		return (
			<div className='space-y-3'>
				<p className='text-destructive'>Could not load your profile.</p>
				<Button type='button' variant='outline' onClick={() => profileQuery.refetch()}>
					Try again
				</Button>
			</div>
		);
	}

	return <ProfileForm profile={profileQuery.data} />;
}

function ProfileForm({ profile }) {
	const { user, setUser } = useAuth();
	const axiosSecure = useAxiosSecure();
	const axiosInstance = useAxios();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const [saving, setSaving] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [picture, setPicture] = useState(profile?.profilePic || '');
	const [values, setValues] = useState(() =>
		Object.fromEntries(
			fields.map((field) => [field.name, profile?.[field.name] ?? '']),
		),
	);

	const onChange = (name) => (event) => {
		setValues((current) => ({ ...current, [name]: event.target.value }));
	};

	const onPhoto = async (event) => {
		const image = event.target.files?.[0];
		event.target.value = '';
		if (!image) return;
		if (image.size > 2 * 1024 * 1024) {
			toast.error('File size exceeds 2MB. Please upload a smaller image.');
			return;
		}
		const formData = new FormData();
		formData.append('file', image);
		setUploading(true);
		try {
			const res = await axiosInstance.post('/upload', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});
			setPicture(res.data.url);
		} catch {
			toast.error('Image upload failed');
		} finally {
			setUploading(false);
		}
	};

	const onSubmit = async (event) => {
		event.preventDefault();
		if (!user?.uid) return;
		const name = String(values.name || '').trim();
		setSaving(true);
		try {
			await axiosSecure.put(`/users/${user.uid}`, {
				name,
				phoneNumber: String(values.phoneNumber || '').trim(),
				location: String(values.location || '').trim(),
				address: String(values.address || '').trim(),
				gender: String(values.gender || '').trim(),
				age: values.age === '' ? null : String(values.age).trim(),
				bloodGroup: String(values.bloodGroup || '').trim(),
				...(picture ? { profilePic: picture } : {}),
			});
			if (auth.currentUser) {
				const nextProfile = {};
				if (name) nextProfile.displayName = name;
				if (picture) nextProfile.photoURL = picture;
				try {
					await updateProfile(auth.currentUser, nextProfile);
					const nextUser = Object.create(auth.currentUser);
					if (name) nextUser.displayName = name;
					if (picture) nextUser.photoURL = picture;
					setUser(nextUser);
				} catch {
					// The saved profile still has the photo.
				}
			}
			await queryClient.invalidateQueries({ queryKey: ['user-profile', user.uid] });
			toast.success('Profile updated');
			navigate('/dashboard/profile');
		} catch {
			toast.error('Could not update your profile');
		} finally {
			setSaving(false);
		}
	};

	return (
		<form onSubmit={onSubmit} className='max-w-2xl space-y-8'>
			<div className='flex items-center gap-4'>
				<PersonAvatar
					name={values.name}
					src={picture}
					className='size-20 text-lg'
				/>
				<div className='space-y-2'>
					<p className='font-display text-2xl'>{values.name || 'Your name'}</p>
					<label className='inline-flex min-h-11 cursor-pointer items-center rounded-md border border-border bg-surface px-3 text-sm hover:bg-brand-soft'>
						<input
							type='file'
							accept='image/*'
							className='sr-only'
							onChange={onPhoto}
							disabled={uploading || saving}
						/>
						{uploading ? 'Uploading photo...' : picture ? 'Change photo' : 'Add photo'}
					</label>
				</div>
			</div>
			<div className='grid gap-4 sm:grid-cols-2'>
				{fields.map((field) => (
					<div
						key={field.name}
						className={cn('space-y-2', field.wide && 'sm:col-span-2')}
					>
						<Label htmlFor={field.name}>{field.label}</Label>
						<Input
							id={field.name}
							name={field.name}
							value={values[field.name]}
							onChange={onChange(field.name)}
						/>
					</div>
				))}
			</div>
			<div className='flex flex-wrap gap-2'>
				<Button type='submit' disabled={saving || uploading}>
					{saving ? 'Saving...' : 'Save profile'}
				</Button>
				<Button type='button' variant='outline' asChild>
					<Link to='/dashboard/profile'>Cancel</Link>
				</Button>
			</div>
		</form>
	);
}

function ProfileFormSkeleton() {
	return (
		<div className='max-w-2xl space-y-8' aria-busy='true'>
			<span className='sr-only'>Loading profile</span>
			<div className='flex items-center gap-4'>
				<Skeleton className='size-20 rounded-full' />
				<div className='space-y-2'>
					<Skeleton className='h-7 w-40' />
					<Skeleton className='h-11 w-32' />
				</div>
			</div>
			<div className='grid gap-4 sm:grid-cols-2'>
				{fields.map((field) => (
					<Skeleton
						key={field.name}
						className={cn('h-16 w-full', field.wide && 'sm:col-span-2')}
					/>
				))}
			</div>
		</div>
	);
}
