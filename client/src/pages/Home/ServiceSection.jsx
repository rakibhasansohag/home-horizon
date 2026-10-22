import { Building2, Home, KeyRound, TrendingUp } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../../components/ui/button';

const services = [
	{
		title: 'Buy a Home',
		description:
			'Explore listings, virtual tours, and tools to find your perfect home easily.',
		icon: Home,
		button: 'Browse Homes',
		link: '/all-properties',
	},
	{
		title: 'Sell Your Property',
		description:
			'Get expert tips and valuation support to sell your property successfully.',
		icon: KeyRound,
		button: 'Sell Now',
		link: '/dashboard/add-property',
	},
	{
		title: 'Rent a Place',
		description:
			'Browse thousands of rental listings and apply online with ease.',
		icon: Building2,
		button: 'Find Rentals',
		link: '/all-properties',
	},
	{
		title: 'Invest Smartly',
		description:
			'Discover profitable investment opportunities in real estate. Those homes are listed with the properties for sale.',
		icon: TrendingUp,
		button: null,
		link: null,
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
								{item.link ? (
									<Button variant='rounded' asChild className='self-start'>
										<Link to={item.link}>{item.button}</Link>
									</Button>
								) : null}
							</li>
						);
					})}
				</ul>
			</div>
		</section>
	);
}

export default ServicesSection;
