import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import useAuth from '@/hooks/useAuth';
import { Link, useLocation, useNavigate } from 'react-router';
import { toast } from 'react-toastify';

import useAxios from '@/hooks/useAxios';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import SocialLogin from '../Login/SocialLogin';
import { Eye, EyeClosed } from 'lucide-react';

function Register() {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();

	const [profilePic, setProfilePic] = useState('');
	const [uploading, setUploading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const { createUser, updateUserProfile } = useAuth();
	const axiosInstance = useAxios();
	const location = useLocation();
	const navigate = useNavigate();
	const from = location.state?.from || '/';

	// TODO : After completing the 89% of the project will update this the validation of password and other things
	const onSubmit = (data) => {
		createUser(data.email, data.password)
			.then(async (result) => {
				const userInfo = {
					email: data.email,
					role: 'user',
					created_at: new Date().toISOString(),
					last_log_in: new Date().toISOString(),
					uid: result.user.uid,
					name: data.name,
					profilePic: profilePic,
					age: null,
					gender: null,
					address: null,
					phoneNumber: null,
					creationTime: result.user?.metadata?.creationTime,
					lastSignInTime: result.user?.metadata?.lastSignInTime,
					loginMethod: result.user?.providerData[0]?.providerId,
					providerId: result.user?.providerData[0]?.providerId,
					status: null,
					...result?.metadata?.customClaims,
				};

				await axiosInstance.post('/users', userInfo);

				await updateUserProfile({
					displayName: data.name,
					photoURL: profilePic,
				});
				console.log(result);

				toast.success('User created successfully');
				navigate(from, { replace: true });
			})
			.catch((error) => toast.error(error.message));
	};

	const handleImageUpload = async (e) => {
		const image = e.target.files[0];

		if (!image) return;

		const maxSizeInBytes = 2 * 1024 * 1024;
		if (image.size > maxSizeInBytes) {
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
			setProfilePic(res.data.url);
			toast.success('Image uploaded successfully');
		} catch (err) {
			console.error('Upload failed:', err);
			toast.error('Image upload failed');
		} finally {
			setUploading(false);
		}
	};

	return (
		<div className='w-full max-w-md mx-auto px-4 py-6 space-y-4'>
			<h1 className='text-2xl font-extrabold'>
				<Link to='/'>
					Home <span className='text-primary'>Horizon</span>
				</Link>
			</h1>

			<h2 className='text-2xl font-bold'>create an account</h2>
			<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
				<div className='flex flex-col gap-2'>
					<Label>Your Name</Label>
					<Input
						type='text'
						placeholder='Your Name...'
						{...register('name', { required: true })}
					/>
					{errors.name && (
						<p className='text-sm text-destructive'>Name is required</p>
					)}
				</div>

				<div className='flex flex-col gap-2'>
					<label className='text-sm font-medium'>Upload Profile Image</label>

					{uploading ? (
						<div className='h-10 w-full animate-pulse rounded-md bg-muted' />
					) : (
						<input
							type='file'
							onChange={handleImageUpload}
							className='input border border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 py-2 px-4 rounded-md'
							accept='image/*'
						/>
					)}

					{profilePic && (
						<img
							src={profilePic}
							alt='Profile Preview'
							className='mt-2 h-16 w-16 rounded-full object-cover'
						/>
					)}
				</div>

				<div className='flex flex-col gap-2'>
					<Label>Email</Label>
					<Input
						type='email'
						placeholder='Email'
						{...register('email', { required: true })}
					/>
					{errors.email && (
						<p className='text-sm text-destructive'>Email is required</p>
					)}
				</div>

				<div className='flex flex-col gap-2 relative'>
					<Label>Password</Label>
					<Input
						type={showPassword ? 'text' : 'password'}
						placeholder='Password'
						{...register('password', {
							required: 'Password is required',
							minLength: {
								value: 6,
								message: 'Password must be at least 6 characters',
							},
							pattern: {
								value:
									/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?]).{6,}$/,
								message: 'Must include one uppercase & one special character',
							},
						})}
					/>
					<button
						type='button'
						onClick={() => setShowPassword((prev) => !prev)}
						className='absolute right-3 top-[35px] text-sm text-muted-foreground hover:text-primary'
					>
						{showPassword ? <EyeClosed /> : <Eye />}
					</button>

					{errors.password && (
						<p className='text-sm text-destructive'>
							{errors.password.message}
						</p>
					)}
				</div>

				<p className='text-sm'>
					Have A Horizon Account?{' '}
					<Link to='/auth/login' className='text-primary underline'>
						Login
					</Link>
				</p>

				<Button type='submit' className='w-full'>
					Register
				</Button>

				<div className='relative my-6'>
					<div className='absolute inset-0 flex items-center'>
						<span className='w-full border-t border-muted' />
					</div>
					<div className='relative flex justify-center text-xs uppercase'>
						<span className='bg-background px-2 text-muted-foreground'>or</span>
					</div>
				</div>
			</form>
			<SocialLogin />
			<p className='text-xs text-muted-foreground text-center mt-4'>
				By submitting, you accept our{' '}
				<Link to='/terms' className='underline'>
					terms of use
				</Link>
			</p>
		</div>
	);
}

export default Register;
