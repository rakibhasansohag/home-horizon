import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router';
import { CircleCheck, Mail, MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import useAxios from '@/hooks/useAxios';
import useAuth from '@/hooks/useAuth';
import useSeo from '@/hooks/useSeo';
import { SITE } from '@/lib/seo';

const SUPPORT_EMAIL = 'homehorizon.support@gmail.com';
const MESSAGE_MAX = 2000;

const channels = [
	{
		icon: Mail,
		label: 'Email',
		value: SUPPORT_EMAIL,
		href: `mailto:${SUPPORT_EMAIL}`,
		note: 'Best for questions about a listing, an offer, or a payment.',
	},
	{
		icon: Phone,
		label: 'Phone',
		value: '01760169982',
		href: 'tel:+8801760169982',
		note: 'For anything that is easier to talk through.',
	},
	{
		icon: MessageCircle,
		label: 'WhatsApp',
		value: '01760169982',
		href: 'https://wa.me/8801760169982',
		note: 'Send photos or documents from your phone.',
	},
];

const topics = [
	{ value: 'buying', label: 'Buying a home' },
	{ value: 'selling', label: 'Selling or listing' },
	{ value: 'offer', label: 'An offer or payment' },
	{ value: 'account', label: 'My account' },
	{ value: 'other', label: 'Something else' },
];

function topicLabel(value) {
	return topics.find((topic) => topic.value === value)?.label || 'Question';
}

function mailtoHref({ name, topic, message }) {
	const subject = `${topicLabel(topic)}: message from ${name || 'a visitor'}`;
	return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
		subject,
	)}&body=${encodeURIComponent(message || '')}`;
}

export default function Contact() {
	const axiosInstance = useAxios();
	const { user } = useAuth();

	useSeo({
		jsonLd: {
			'@context': 'https://schema.org',
			'@type': 'ContactPage',
			name: 'Contact HomeHorizon',
			url: `${SITE.url}/contact`,
			mainEntity: {
				'@type': 'Organization',
				name: SITE.name,
				url: `${SITE.url}/`,
				email: SUPPORT_EMAIL,
				telephone: '+8801760169982',
			},
		},
	});

	const {
		register,
		handleSubmit,
		reset,
		watch,
		getValues,
		setValue,
		formState: { errors },
	} = useForm({
		defaultValues: { name: '', email: '', topic: 'buying', message: '', website: '' },
	});

	useEffect(() => {
		if (!user) return;
		if (!getValues('name') && user.displayName) setValue('name', user.displayName);
		if (!getValues('email') && user.email) setValue('email', user.email);
	}, [user, getValues, setValue]);

	const sendMessage = useMutation({
		mutationFn: async (data) => {
			const res = await axiosInstance.post('/public/contact', data);
			return res.data;
		},
	});

	const messageLength = watch('message')?.length || 0;
	const sent = sendMessage.isSuccess ? sendMessage.variables : null;
	const failure = sendMessage.error;
	const failureStatus = failure?.response?.status;
	const serverMessage = failure?.response?.data?.message;
	const unreachable = failure && failureStatus !== 400 && failureStatus !== 429;

	const startOver = () => {
		sendMessage.reset();
		reset({
			name: getValues('name'),
			email: getValues('email'),
			topic: 'buying',
			message: '',
			website: '',
		});
	};

	return (
		<section className='section py-12 md:py-16'>
			<div className='grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16'>
				<div>
					<h1 className='font-display text-4xl md:text-5xl'>Contact us</h1>
					<p className='mt-4 max-w-[46ch] text-lg text-muted-foreground'>
						Questions about a home, an offer, or your account? Send us a
						message and we will reply by email.
					</p>

					<ul className='mt-10 divide-y divide-border border-y border-border'>
						{channels.map((channel) => {
							const Icon = channel.icon;
							return (
								<li key={channel.label} className='flex gap-4 py-5'>
									<Icon className='mt-1 size-5 shrink-0 text-brand' aria-hidden='true' />
									<div className='min-w-0'>
										<p className='text-sm text-muted-foreground'>{channel.label}</p>
										<a
											href={channel.href}
											target={channel.href.startsWith('http') ? '_blank' : undefined}
											rel={channel.href.startsWith('http') ? 'noreferrer' : undefined}
											className='break-all text-lg font-medium transition-colors duration-200 hover:text-brand hover:underline'
										>
											{channel.value}
										</a>
										<p className='mt-1 text-sm text-muted-foreground'>{channel.note}</p>
									</div>
								</li>
							);
						})}
					</ul>

					<p className='mt-8 text-base text-muted-foreground'>
						Looking for a home?{' '}
						<Link to='/all-properties' className='font-medium text-brand hover:underline'>
							Browse verified listings
						</Link>
					</p>
				</div>

				<div className='rounded-lg border border-border bg-surface p-6 md:p-8'>
					{sent ? (
						<div className='flex min-h-80 flex-col items-start justify-center' role='status'>
							<CircleCheck className='size-8 text-brand' aria-hidden='true' />
							<h2 className='mt-4 font-display text-3xl'>Message sent</h2>
							<p className='mt-3 max-w-[48ch] text-base text-muted-foreground'>
								Thanks, {sent.name}. We will reply to{' '}
								<span className='font-medium text-foreground'>{sent.email}</span>.
							</p>
							<Button type='button' variant='outline' className='mt-8' onClick={startOver}>
								Send another message
							</Button>
						</div>
					) : (
						<form
							onSubmit={handleSubmit((data) => sendMessage.mutate(data))}
							noValidate
							className='space-y-6'
						>
							<h2 className='font-display text-2xl'>Send a message</h2>

							<div className='grid gap-6 sm:grid-cols-2'>
								<div className='space-y-2'>
									<Label htmlFor='contact-name'>Your name</Label>
									<Input
										id='contact-name'
										autoComplete='name'
										aria-invalid={!!errors.name}
										{...register('name', {
											required: 'Enter your name.',
											minLength: { value: 2, message: 'Enter your name.' },
											maxLength: { value: 80, message: 'Use 80 characters or fewer.' },
										})}
									/>
									{errors.name ? (
										<p className='text-sm text-destructive'>{errors.name.message}</p>
									) : null}
								</div>
								<div className='space-y-2'>
									<Label htmlFor='contact-email'>Email</Label>
									<Input
										id='contact-email'
										type='email'
										autoComplete='email'
										placeholder='you@example.com'
										aria-invalid={!!errors.email}
										{...register('email', {
											required: 'Enter your email so we can reply.',
											pattern: {
												value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
												message: 'Enter a valid email address.',
											},
										})}
									/>
									{errors.email ? (
										<p className='text-sm text-destructive'>{errors.email.message}</p>
									) : null}
								</div>
							</div>

							<fieldset>
								<legend className='text-sm font-medium'>What is it about?</legend>
								<div className='mt-3 flex flex-wrap gap-2'>
									{topics.map((topic) => (
										<label key={topic.value} className='cursor-pointer'>
											<input
												type='radio'
												value={topic.value}
												className='peer sr-only'
												{...register('topic', { required: true })}
											/>
											<span className='inline-flex min-h-11 items-center rounded-full border border-border bg-surface px-4 text-sm transition-colors duration-200 hover:border-brand peer-checked:border-brand peer-checked:bg-brand-soft peer-checked:font-medium peer-checked:text-brand peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50'>
												{topic.label}
											</span>
										</label>
									))}
								</div>
							</fieldset>

							<div className='space-y-2'>
								<div className='flex items-baseline justify-between gap-4'>
									<Label htmlFor='contact-message'>Message</Label>
									<span
										className={`text-sm tabular-nums ${
											messageLength > MESSAGE_MAX ? 'text-destructive' : 'text-muted-foreground'
										}`}
									>
										{messageLength}/{MESSAGE_MAX}
									</span>
								</div>
								<Textarea
									id='contact-message'
									rows={6}
									className='min-h-40'
									placeholder='Include the listing name or your offer details if your question is about a specific home.'
									aria-invalid={!!errors.message}
									{...register('message', {
										required: 'Write your message.',
										minLength: { value: 10, message: 'Write at least 10 characters.' },
										maxLength: {
											value: MESSAGE_MAX,
											message: `Keep it under ${MESSAGE_MAX} characters.`,
										},
									})}
								/>
								{errors.message ? (
									<p className='text-sm text-destructive'>{errors.message.message}</p>
								) : null}
							</div>

							<div className='hidden' aria-hidden='true'>
								<label htmlFor='contact-website'>Website</label>
								<input
									id='contact-website'
									type='text'
									tabIndex={-1}
									autoComplete='off'
									{...register('website')}
								/>
							</div>

							{failure ? (
								<div
									role='alert'
									className='rounded-md border border-danger/30 bg-danger-soft p-4 text-base'
								>
									<p className='text-danger'>
										{unreachable
											? 'Your message could not be sent right now.'
											: serverMessage || 'Your message could not be sent.'}
									</p>
									{unreachable ? (
										<a
											href={mailtoHref(sendMessage.variables || getValues())}
											className='mt-2 inline-flex font-medium text-brand hover:underline'
										>
											Email it to us instead
										</a>
									) : null}
								</div>
							) : null}

							<div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
								<p className='text-sm text-muted-foreground'>
									We only use your email to reply to this message.
								</p>
								<Button
									type='submit'
									size='lg'
									disabled={sendMessage.isPending}
									className='sm:min-w-40'
								>
									{sendMessage.isPending ? 'Sending…' : 'Send message'}
								</Button>
							</div>
						</form>
					)}
				</div>
			</div>
		</section>
	);
}
