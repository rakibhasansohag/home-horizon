import {
	BadgeCheck,
	Building2,
	ClipboardList,
	Heart,
	Home,
	LogOut,
	Megaphone,
	MessageSquare,
	Plus,
	Settings,
	ShoppingBag,
	Users,
} from 'lucide-react';
import { useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from '@/components/ui/sidebar';
import useUserRole from '../hooks/useUserRole';
import GlobalLoading from './Shared/GlobalLoading';
import useAuth from '../hooks/useAuth';
import { toast } from 'react-toastify';

const groups = [
	{
		label: 'Account',
		items: [
			{
				title: 'Home',
				url: '/dashboard',
				icon: Home,
				allowedRoles: ['user', 'agent', 'admin'],
			},
			{
				title: 'My Profile',
				url: '/dashboard/profile',
				icon: Settings,
				allowedRoles: ['user', 'agent', 'admin'],
			},
			{
				title: 'My reviews',
				url: '/dashboard/my-reviews',
				icon: MessageSquare,
				allowedRoles: ['user', 'admin'],
			},
		],
	},
	{
		label: 'Buying',
		items: [
			{
				title: 'Wishlist',
				url: '/dashboard/wishlist',
				icon: Heart,
				allowedRoles: ['user'],
			},
			{
				title: 'Property bought',
				url: '/dashboard/property-bought',
				icon: ShoppingBag,
				allowedRoles: ['user'],
			},
		],
	},
	{
		label: 'Listings',
		items: [
			{
				title: 'Add Property',
				url: '/dashboard/add-property',
				icon: Plus,
				allowedRoles: ['agent'],
			},
			{
				title: 'My Added Properties',
				url: '/dashboard/my-property',
				icon: ClipboardList,
				allowedRoles: ['agent'],
			},
			{
				title: 'My Sold Properties',
				url: '/dashboard/sold-properties',
				icon: BadgeCheck,
				allowedRoles: ['agent'],
			},
			{
				title: 'Requested Properties',
				url: '/dashboard/agent-offer-properties',
				icon: Building2,
				allowedRoles: ['agent'],
			},
		],
	},
	{
		label: 'Administration',
		items: [
			{
				title: 'Manage Properties',
				url: '/dashboard/manage-properties',
				icon: Building2,
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
				icon: MessageSquare,
				allowedRoles: ['admin'],
			},
			{
				title: 'Advertise Property',
				url: '/dashboard/advertise-property',
				icon: Megaphone,
				allowedRoles: ['admin'],
			},
		],
	},
];

export function AppSidebar() {
	const { role, isLoading } = useUserRole();
	const { logOut } = useAuth();
	const { pathname } = useLocation();
	const { isMobile, setOpenMobile } = useSidebar();

	useEffect(() => {
		if (isMobile) setOpenMobile(false);
	}, [pathname, isMobile, setOpenMobile]);

	if (isLoading) return <GlobalLoading />;

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

	const visibleGroups = groups
		.map((group) => ({
			...group,
			items: group.items.filter((item) => item.allowedRoles.includes(role)),
		}))
		.filter((group) => group.items.length > 0);

	return (
		<Sidebar>
			<SidebarHeader className='border-b border-sidebar-border px-4 py-4'>
				<Link to='/' className='text-xl font-semibold text-sidebar-foreground'>
					Home<span className='text-brand'>Horizon</span>
				</Link>
			</SidebarHeader>
			<SidebarContent>
				{visibleGroups.map((group) => (
					<SidebarGroup key={group.label}>
						<SidebarGroupLabel className='text-sm text-ink-muted'>
							{group.label}
						</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{group.items.map((item) => {
									const active =
										item.url === '/dashboard'
											? pathname === '/dashboard'
											: pathname.startsWith(item.url);
									return (
										<SidebarMenuItem key={item.title}>
											<SidebarMenuButton asChild isActive={active}>
												<NavLink
													to={item.url}
													end={item.url === '/dashboard'}
												>
													<item.icon />
													<span>{item.title}</span>
												</NavLink>
											</SidebarMenuButton>
										</SidebarMenuItem>
									);
								})}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				))}
			</SidebarContent>
			<SidebarFooter className='border-t border-sidebar-border'>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild>
							<button type='button' onClick={handleLogOut}>
								<LogOut />
								<span>Logout</span>
							</button>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
