import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const pages = {
	'/about-us': {
		title: 'About',
		line: 'A short note about HomeHorizon is on the way.',
	},
	'/contact': {
		title: 'Contact',
		line: 'A contact form is on the way. Leave an email and we will write when it is ready.',
	},
	'/legal/terms-of-service': {
		title: 'Terms of service',
		line: 'The terms are being written.',
	},
	'/legal/privacy-policy': {
		title: 'Privacy policy',
		line: 'The privacy policy is being written.',
	},
	'/legal/cookie-policy': {
		title: 'Cookie policy',
		line: 'The cookie policy is being written.',
	},
};

export default function ComingSoon() {
	const [email, setEmail] = useState('');
	const [sent, setSent] = useState(false);
	const [busy, setBusy] = useState(false);
	const navigate = useNavigate?.() ?? (() => {});
	const { pathname } = useLocation();
	const page = pages[pathname] || {
		title: 'Coming soon',
		line: 'This page is still being written.',
	};

	function handleSubmit(e) {
		e.preventDefault();
		if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
			return toast.error('Please enter a valid email');
		}
		setBusy(true);
		setTimeout(() => {
			setBusy(false);
			setSent(true);
			setEmail('');
		}, 900);
	}

	return (
		<div className='mx-auto w-full max-w-xl px-4 py-16'>
			<p className='text-sm text-brand'>HomeHorizon</p>
			<h1 className='mt-2 font-display text-4xl'>{page.title}</h1>
			<p className='mt-3 text-base text-muted-foreground'>{page.line}</p>

			<form onSubmit={handleSubmit} className='mt-8 space-y-3'>
				<label htmlFor='notify-email' className='text-sm font-medium'>
					Email
				</label>
				<div className='flex flex-col gap-3 sm:flex-row'>
					<Input
						id='notify-email'
						type='email'
						placeholder='you@email.com'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						aria-label='Email for notification'
						disabled={busy || sent}
					/>
					<Button type='submit' disabled={busy || sent}>
						{busy ? 'Sending…' : sent ? 'Subscribed' : 'Notify me'}
					</Button>
				</div>
				<p className='text-sm text-muted-foreground'>
					You will get one email when this page is ready.
				</p>
			</form>

			<div className='mt-6 flex flex-wrap items-center gap-4'>
				<Button variant='outline' type='button' onClick={() => navigate('/')}>
					Back to home
				</Button>
				<Link to='/dashboard' className='text-base text-brand hover:underline'>
					Go to dashboard
				</Link>
			</div>
		</div>
	);
}
