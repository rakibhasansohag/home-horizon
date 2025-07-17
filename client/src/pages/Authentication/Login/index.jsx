import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import useAuth from '@/hooks/useAuth';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import SocialLogin from './SocialLogin';

function Login() {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();
	const { signIn } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const from = location.state?.from || '/';

	const [showPassword, setShowPassword] = useState(false);

	const onSubmit = (data) => {
		signIn(data?.email, data?.password)
			.then(() => {
				toast.success('Login successful');
				navigate(from);
			})
			.catch((error) => {
				toast.error(error.message);
			});
	};

	return (
		<div className='flex w-full justify-center items-center'>
			{/* Left Form Side */}
			<div className='w-full max-w-md mx-auto flex flex-col justify-center px-6'>
				<div className='space-y-4'>
					<h1 className='text-2xl font-extrabold'>
						<Link to='/'>
							Home <span className='text-primary'>Horizon</span>
						</Link>
					</h1>

					<h2 className='text-2xl font-bold'>Sign in</h2>

					<form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
						<div className='space-y-2'>
							<Label htmlFor='email'>Email Address</Label>
							<Input
								id='email'
								type='email'
								placeholder='you@example.com'
								{...register('email', { required: true })}
								autoComplete='email'
							/>
							{errors.email && (
								<p className='text-sm text-destructive mt-1'>
									Email is required
								</p>
							)}
						</div>

						<div className='space-y-2'>
							<Label htmlFor='password'>Password</Label>
							<div className='relative'>
								<Input
									id='password'
									type={showPassword ? 'text' : 'password'}
									placeholder='Your password'
									{...register('password', { required: true, minLength: 6 })}
								/>
								<button
									type='button'
									className='absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground'
									onClick={() => setShowPassword(!showPassword)}
								>
									{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
								</button>
							</div>
							{errors.password && (
								<p className='text-sm text-destructive mt-1'>
									Password must be at least 6 characters
								</p>
							)}
						</div>

						<Button type='submit' className='w-full'>
							Continue
						</Button>

						<p className='text-center text-sm'>
							New to Horizon?{' '}
							<Link
								state={{ from }}
								to='/auth/register'
								className='text-primary font-medium hover:underline'
							>
								Create account
							</Link>
						</p>

						<div className='relative my-6'>
							<div className='absolute inset-0 flex items-center'>
								<span className='w-full border-t border-muted' />
							</div>
							<div className='relative flex justify-center text-xs uppercase'>
								<span className='bg-background px-2 text-muted-foreground'>
									or
								</span>
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
			</div>
		</div>
	);
}

export default Login;
