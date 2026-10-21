import { Building2, Home, KeyRound, TrendingUp } from 'lucide-react';
import { Button } from '../../components/ui/button';

const services = [
	{
		title: 'Buy a Home',
		description:
			'Explore listings, virtual tours, and tools to find your perfect home easily.',
		icon: Home,
		button: 'Browse Homes',
		link: '/buy',
	},
	{
		title: 'Sell Your Property',
		description:
			'Get expert tips and valuation support to sell your property successfully.',
		icon: KeyRound,
		button: 'Sell Now',
		link: '/sell',
	},
	{
		title: 'Rent a Place',
		description:
			'Browse thousands of rental listings and apply online with ease.',
		icon: Building2,
		button: 'Find Rentals',
		link: '/rent',
	},
	{
		title: 'Invest Smartly',
		description: 'Discover profitable investment opportunities in real estate.',
		icon: TrendingUp,
		button: 'Start Investing',
		link: '/invest',
	},
];

function ServicesSection() {
	return (
		<section className='bg-paper py-16'>
			<div className='section'>
				<h2 className='font-display text-3xl'>Our Services</h2>
				<ul className='mt-8 grid gap-4 sm:grid-cols-2'>
					{services.map((item) => {
						const Icon = item.icon;
						return (
							<li
								key={item.title}
								className='flex flex-col gap-3 rounded-lg border border-border bg-surface p-6 transition-colors duration-200 hover:border-brand hover:bg-brand-soft'
							>
								<div className='flex items-center gap-3'>
									<Icon className='size-5 text-brand' aria-hidden='true' />
									<h3 className='text-xl font-semibold'>{item.title}</h3>
								</div>
								<p className='flex-1 text-base text-muted-foreground'>
									{item.description}
								</p>
								<Button variant='rounded' href={item.link} className='self-start'>
									{item.button}
								</Button>
							</li>
						);
					})}
				</ul>
			</div>
		</section>
	);
}

export default ServicesSection;
