import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
import { FiClock, FiMail, FiCreditCard, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router';

export default function ComingSoonPaymentPage() {
	const [email, setEmail] = useState('');
	const [status, setStatus] = useState(null); // null | 'ok' | 'error'
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
		<div className='min-h-[70vh] flex items-center justify-center p-6 max-w-7xl mx-auto'>
			<div className=' w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center'>
				{/* left: illustration + badge */}
				<motion.div
					initial={{ opacity: 0, x: -30 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.6 }}
					className='relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-accent/6 border border-border/40 p-6'
				>
					<div className='absolute -right-16 -top-16 w-48 h-48 rounded-full bg-gradient-to-tr from-primary to-secondary opacity-20 blur-xl' />

					<div className='flex items-center gap-3 mb-4'>
						<div className='bg-primary/10 text-primary w-12 h-12 rounded-lg flex items-center justify-center shadow-sm'>
							<FiClock className='w-6 h-6' />
						</div>
						<div>
							<h3 className='text-lg font-semibold text-foreground'>
								Payments — Coming soon
							</h3>
							<p className='text-sm text-muted-foreground'>
								Secure checkout & subscriptions are almost here.
							</p>
						</div>
					</div>

					<div className='mt-4 text-sm text-muted-foreground space-y-3'>
						<div className='flex items-start gap-3'>
							<div className='w-10'>🔒</div>
							<div>
								<div className='font-medium'>Secure card processing</div>
								<div className='text-xs'>
									PCI-compliant payments via Stripe (coming soon)
								</div>
							</div>
						</div>

						<div className='flex items-start gap-3'>
							<div className='w-10'>🚀</div>
							<div>
								<div className='font-medium'>Fast one-tap checkout</div>
								<div className='text-xs'>
									Save cards, subscription billing & receipts
								</div>
							</div>
						</div>

						<div className='flex items-start gap-3'>
							<div className='w-10'>📈</div>
							<div>
								<div className='font-medium'>Payment analytics</div>
								<div className='text-xs'>
									Sales, refunds and payouts dashboard
								</div>
							</div>
						</div>
					</div>

					{/* big mock card */}
					<motion.div
						whileHover={{ scale: 1.02 }}
						className='mt-6 rounded-xl bg-card p-4 shadow-md border border-border/30'
					>
						<div className='flex items-center justify-between'>
							<div className='text-sm text-muted-foreground'>Demo card</div>
							<div className='text-xs text-muted-foreground'>Exp 12/28</div>
						</div>
						<div className='mt-3 flex items-center justify-between'>
							<div className='text-xl font-semibold tracking-wide'>
								**** **** **** 4242
							</div>
							<div className='text-sm text-muted-foreground'>$0.00</div>
						</div>
					</motion.div>
				</motion.div>

				{/* right: CTA */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.1 }}
					className='rounded-2xl p-6 bg-background border border-border/40'
				>
					<div className='flex items-center gap-3 mb-4'>
						<div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary'>
							<FiCreditCard className='w-5 h-5' />
						</div>
						<div>
							<h2 className='text-2xl font-bold text-foreground'>
								We'll be ready soon
							</h2>
							<p className='text-sm text-muted-foreground'>
								We're finishing the payments integration. Want to be notified
								when it's live?
							</p>
						</div>
					</div>

					<form onSubmit={handleNotify} className='space-y-3'>
						<label className='block text-sm text-muted-foreground'>Email</label>
						<div className='flex gap-2'>
							<div className='flex-1'>
								<input
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder='you@company.com'
									className='w-full px-4 py-3 rounded-lg border border-border/30 bg-card text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30'
									type='email'
								/>
							</div>
							<button
								type='submit'
								className='inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold shadow hover:brightness-105 disabled:opacity-60'
								disabled={loading}
							>
								{loading ? 'Saving...' : 'Notify me'}
								<FiMail className='w-4 h-4' />
							</button>
						</div>

						{status === 'ok' && (
							<div className='mt-1 text-sm text-success-foreground flex items-center gap-2'>
								<FiCheckCircle /> You're on the list — we'll email you when it's
								live.
							</div>
						)}
						{status === 'error' && (
							<div className='mt-1 text-sm text-destructive flex items-center gap-2'>
								<span>Enter a valid email address.</span>
							</div>
						)}

						<div className='mt-4 text-xs text-muted-foreground'>
							In the meantime, you can still use our manual checkout by
							contacting the agent directly or using bank transfer. This page
							will update automatically once payments are enabled.
						</div>

						<div className='mt-6 flex gap-3'>
							<a
								href={`mailto:rakibhasansohag133@gmail.com`}
								className='text-sm px-4 py-2 rounded-md border border-border/20 hover:bg-primary/6'
							>
								Contact support
							</a>
							<Link
								to='/dashboard'
								className='text-sm px-4 py-2 rounded-md bg-secondary text-secondary-foreground'
							>
								Back to dashboard
							</Link>
						</div>
					</form>

					<div className='mt-6 text-xs text-muted-foreground'>
						Version: payments-coming-soon • ETA: Q3
					</div>
				</motion.div>
			</div>
		</div>
	);
}
