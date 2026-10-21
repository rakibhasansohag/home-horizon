import { useState } from 'react';
import { Link } from 'react-router';
import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ComingSoonPaymentPage() {
	const [email, setEmail] = useState('');
	const [status, setStatus] = useState(null);
	const [loading, setLoading] = useState(false);

	async function handleNotify(e) {
		e.preventDefault();
		if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
			setStatus('error');
			return;
		}
		setLoading(true);

		try {
			await new Promise((r) => setTimeout(r, 800));
			setStatus('ok');
			setEmail('');
		} catch (err) {
			setStatus('error');
			console.error(err);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className='w-full max-w-xl'>
			<div className='flex items-center gap-3'>
				<CreditCard className='size-5 text-brand' aria-hidden='true' />
				<h2 className='font-display text-3xl'>Payments</h2>
			</div>
			<p className='mt-3 text-base text-muted-foreground'>
				Checkout is not open yet. Leave an email and we will write when it is.
			</p>

			<form onSubmit={handleNotify} className='mt-8 space-y-3'>
				<label htmlFor='payment-email' className='text-sm font-medium'>
					Email
				</label>
				<div className='flex flex-col gap-3 sm:flex-row'>
					<Input
						id='payment-email'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder='you@email.com'
						type='email'
					/>
					<Button type='submit' disabled={loading}>
						{loading ? 'Saving...' : 'Notify me'}
					</Button>
				</div>

				{status === 'ok' && (
					<p className='text-sm text-success'>
						You are on the list. We will email you when payments are live.
					</p>
				)}
				{status === 'error' && (
					<p className='text-sm text-destructive'>Enter a valid email address.</p>
				)}
			</form>

			<div className='mt-6 flex flex-wrap gap-3'>
				<a
					href='mailto:rakibhasansohag133@gmail.com'
					className='inline-flex min-h-11 items-center text-base text-brand hover:underline'
				>
					Contact support
				</a>
				<Button asChild variant='outline'>
					<Link to='/dashboard'>Back to dashboard</Link>
				</Button>
			</div>
		</div>
	);
}
