import { Home, List, PlusCircle, Settings, Users } from 'lucide-react';
import { HiBuildingOffice } from 'react-icons/hi2';
import {
	FaBuildingUser,
	FaClipboardList,
	FaMoneyBillTrendUp,
} from 'react-icons/fa6';
import { MdRealEstateAgent, MdReviews } from 'react-icons/md';
import { GoCodeReview } from 'react-icons/go';
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Link, NavLink } from 'react-router';
import useUserRole from '../hooks/useUserRole';
import GlobalLoading from './Shared/GlobalLoading';
import useAuth from '../hooks/useAuth';
import { toast } from 'react-toastify';

const items = [
	// Shared "Home" for all roles
	{
		title: 'Home',
		url: '/dashboard',
		icon: Home,
		allowedRoles: ['user', 'agent', 'admin'],
	},

	// User only
	{
		title: 'My Profile',
		url: '/dashboard/profile',
		icon: Settings,
		allowedRoles: ['user', 'agent', 'admin'],
	},
	{
		title: 'Wishlist',
		url: '/dashboard/wishlist',
		icon: FaClipboardList,
		allowedRoles: ['user'],
	},
	{
		title: 'Property bought',
		url: '/dashboard/property-bought',
		icon: FaBuildingUser,
		allowedRoles: ['user'],
	},
	{
		title: 'My reviews',
		url: '/dashboard/my-reviews',
		icon: MdReviews,
		allowedRoles: ['user', 'admin'],
	},

	// Agent only
	{
		title: 'Add Property',
		url: '/dashboard/add-property',
		icon: PlusCircle,
		allowedRoles: ['agent'],
	},
	{
		title: 'My Added Properties',
		url: '/dashboard/my-property',
		icon: List,
		allowedRoles: ['agent'],
	},
	{
		title: 'My Sold Properties',
		url: '/dashboard/sold-properties',
		icon: FaMoneyBillTrendUp,
		allowedRoles: ['agent'],
	},
	{
		title: 'Requested Properties',
		url: '/dashboard/agent-offer-properties',
		icon: MdRealEstateAgent,
		allowedRoles: ['agent'],
	},

	// Admin only
	{
		title: 'Manage Properties',
		url: '/dashboard/manage-properties',
		icon: HiBuildingOffice,
		allowedRoles: ['admin'],
	},
	{
		title: 'Manage Users',
		url: '/dashboard/manage-users',
		icon: Users,
		allowedRoles: ['admin'],
	},
	{
		title: 'Manage Reviews',
		url: '/dashboard/manage-reviews',
		icon: GoCodeReview,
		allowedRoles: ['admin'],
	},
	{
		title: 'Advertise Property',
		url: '/dashboard/advertise-property',
		icon: MdRealEstateAgent,
		allowedRoles: ['admin'],
	},
	{
		title: 'Logout',
		url: '/auth/logout',
		icon: Settings,
		allowedRoles: ['user', 'agent', 'admin'],
		action: 'logout',
	},
];

export function AppSidebar() {
	const { role, isLoading } = useUserRole();

	const { logOut } = useAuth();

	if (isLoading) return <GlobalLoading />;

	const filteredItems = items.filter((item) =>
		item.allowedRoles.includes(role),
	);
	const handleLogOut = () => {
		logOut()
			.then(() => {
				toast.success('Successfully logged out');
			})
			.catch((err) => {
				console.log(err);
				toast.error(err.message || 'Something went wrong');
			});
	};
	return (
		<Sidebar>
			<SidebarContent className='pt-20'>
				<SidebarGroup>
					<SidebarGroupLabel className='text-primary text-2xl font-bold mb-2'>
						<Link to='/' className='w-full'>
							Home Horizon
						</Link>
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{filteredItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										{item.action === 'logout' ? (
											<button
												type='button'
												onClick={handleLogOut}
												aria-label='Logout'
												className='flex items-center gap-3 w-full text-left'
											>
												<item.icon />
												<span>{item.title}</span>
											</button>
										) : (
											<NavLink to={item.url} end={item.url === '/dashboard'}>
												<item.icon />
												<span>{item.title}</span>
											</NavLink>
										)}
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
