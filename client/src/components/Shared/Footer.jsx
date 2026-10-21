import { Link, NavLink } from 'react-router';

const Footer = () => {
	const contactUs = [
		{
			name: 'homehorizon.support@gmail.com',
			to: 'mailto:homehorizon.support@gmail.com',
		},
		{ name: '01760169982', to: 'tel:+8801760169982' },
		{ name: 'WhatsApp: 01760169982', to: 'https://wa.me/8801760169982' },
	];

	const pages = [
		{ label: 'Home', to: '/' },
		{ label: 'All Properties', to: '/all-properties' },
		{ label: 'About Us', to: '/about-us' },
		{ label: 'Contact', to: '/contact' },
	];

	const terms = [
		{ label: 'Terms of Service', to: '/legal/terms-of-service' },
		{ label: 'Privacy Policy', to: '/legal/privacy-policy' },
	];

	const socials = [
		{ label: 'Facebook', to: 'https://www.facebook.com/rakibhasansohag133/' },
		{ label: 'Instagram', to: 'https://www.instagram.com/rakibhasansohag133' },
		{ label: 'LinkedIn', to: 'https://www.linkedin.com/in/rakib-hasan-sohag/' },
		{ label: 'GitHub', to: 'https://github.com/rakibhasansohag' },
	];

	return (
		<footer className='border-t border-border bg-paper text-foreground'>
			<div className='section grid grid-cols-1 gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4'>
				<div>
					<Link to='/' className='text-xl font-semibold'>
						Home<span className='text-brand'>Horizon</span>
					</Link>
					<p className='mt-4 max-w-[36ch] text-base text-muted-foreground'>
						Verified listings, maps, and reviews for buying and selling homes.
					</p>
				</div>

				<nav aria-label='Footer'>
					<h2 className='text-base font-semibold'>Explore</h2>
					<ul className='mt-3 space-y-1'>
						{pages.map((page) => (
							<li key={page.to}>
								<NavLink
									to={page.to}
									className='inline-flex min-h-11 items-center text-base text-muted-foreground hover:text-brand'
								>
									{page.label}
								</NavLink>
							</li>
						))}
					</ul>
				</nav>

				<div>
					<h2 className='text-base font-semibold'>Contact</h2>
					<ul className='mt-3 space-y-1'>
						{contactUs.map((info) => (
							<li key={info.name}>
								<a
									href={info.to}
									className='inline-flex min-h-11 items-center text-base text-muted-foreground hover:text-brand'
								>
									{info.name}
								</a>
							</li>
						))}
					</ul>
				</div>

				<div>
					<h2 className='text-base font-semibold'>Legal</h2>
					<ul className='mt-3 space-y-1'>
						{terms.map((topic) => (
							<li key={topic.to}>
								<Link
									to={topic.to}
									className='inline-flex min-h-11 items-center text-base text-muted-foreground hover:text-brand'
								>
									{topic.label}
								</Link>
							</li>
						))}
					</ul>
				</div>
			</div>

			<div className='section flex flex-col gap-3 border-t border-border py-6 sm:flex-row sm:items-center sm:justify-between'>
				<p className='text-sm text-muted-foreground'>
					© {new Date().getFullYear()} HomeHorizon
				</p>
				<ul className='flex flex-wrap gap-x-4'>
					{socials.map((item) => (
						<li key={item.label}>
							<a
								href={item.to}
								target='_blank'
								rel='noreferrer'
								className='inline-flex min-h-11 items-center text-base text-muted-foreground hover:text-brand'
							>
								{item.label}
							</a>
						</li>
					))}
				</ul>
			</div>
		</footer>
	);
};

export default Footer;
