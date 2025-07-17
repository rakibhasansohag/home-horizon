import React from 'react';
import { FaHome, FaDollarSign, FaBuilding, FaChartLine } from 'react-icons/fa';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
import { Button } from '../../components/ui/button';

const services = [
	{
		title: 'Buy a Home',
		description:
			'Explore listings, virtual tours, and tools to find your perfect home easily.',
		icon: <FaHome className='text-4xl text-primary ' />,
		button: 'Browse Homes',
		link: '/buy',
	},
	{
		title: 'Sell Your Property',
		description:
			'Get expert tips and valuation support to sell your property successfully.',
		icon: <FaDollarSign className='text-4xl text-primary ' />,
		button: 'Sell Now',
		link: '/sell',
	},
	{
		title: 'Rent a Place',
		description:
			'Browse thousands of rental listings and apply online with ease.',
		icon: <FaBuilding className='text-4xl text-primary ' />,
		button: 'Find Rentals',
		link: '/rent',
	},
	{
		title: 'Invest Smartly',
		description: 'Discover profitable investment opportunities in real estate.',
		icon: <FaChartLine className='text-4xl text-primary' />,
		button: 'Start Investing',
		link: '/invest',
	},
];

function ServicesSection() {
	return (
		<section className='bg-background dark:bg-input py-16'>
			<div className='section text-center'>
				<h2 className='text-3xl font-bold mb-6'>Our Services</h2>
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
					{services.map((item, idx) => (
						<motion.div
							key={idx}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: idx * 0.1 }}
							viewport={{ once: true }}
							className='bg-white dark:bg-input rounded-2xl shadow-md p-6 hover:shadow-xl transition-all text-center flex flex-col justify-center items-center'
						>
							<span className='bg-background rounded-full p-5 flex justify-center items-center mb-4'>
								{item.icon}
							</span>
							<h3 className='text-lg font-semibold mb-2'>{item.title}</h3>
							<p className='text-sm text-muted-foreground mb-4'>
								{item.description}
							</p>
							<Button variant='rounded' href={item.link}>
								{item.button}
							</Button>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}

export default ServicesSection;
