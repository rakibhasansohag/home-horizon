import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import useAuth from '@/hooks/useAuth';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import useUserProfile from '@/hooks/useUserProfile';
import { gateQuery } from '@/lib/queryWait';

const fields = [
	{ name: 'name', label: 'Name' },
	{ name: 'phoneNumber', label: 'Phone' },
	{ name: 'location', label: 'Location' },
	{ name: 'address', label: 'Address' },
	{ name: 'gender', label: 'Gender' },
	{ name: 'age', label: 'Age' },
	{ name: 'bloodGroup', label: 'Blood group' },
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
	const { user } = useAuth();
	const axiosSecure = useAxiosSecure();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const [saving, setSaving] = useState(false);
	const [values, setValues] = useState(() =>
		Object.fromEntries(
			fields.map((field) => [field.name, profile?.[field.name] ?? '']),
		),
	);

	const onChange = (name) => (event) => {
		setValues((current) => ({ ...current, [name]: event.target.value }));
	};

	const onSubmit = async (event) => {
		event.preventDefault();
		if (!user?.uid) return;
		setSaving(true);
		try {
			await axiosSecure.put(`/users/${user.uid}`, {
				name: String(values.name || '').trim(),
				phoneNumber: String(values.phoneNumber || '').trim(),
				location: String(values.location || '').trim(),
				address: String(values.address || '').trim(),
				gender: String(values.gender || '').trim(),
				age: values.age === '' ? null : String(values.age).trim(),
				bloodGroup: String(values.bloodGroup || '').trim(),
			});
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
		<form onSubmit={onSubmit} className='max-w-xl space-y-4'>
			{fields.map((field) => (
				<div key={field.name} className='space-y-2'>
					<Label htmlFor={field.name}>{field.label}</Label>
					<Input
						id={field.name}
						name={field.name}
						value={values[field.name]}
						onChange={onChange(field.name)}
					/>
				</div>
			))}
			<div className='flex flex-wrap gap-2'>
				<Button type='submit' disabled={saving}>
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
		<div className='max-w-xl space-y-4' aria-busy='true'>
			<span className='sr-only'>Loading profile</span>
			{fields.map((field) => (
				<Skeleton key={field.name} className='h-16 w-full' />
			))}
		</div>
	);
}
