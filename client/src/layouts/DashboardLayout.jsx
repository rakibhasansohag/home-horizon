import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Outlet, useLocation } from 'react-router';
import useDynamicTitle from '../hooks/useDynamicTitle';

const titles = [
	['/dashboard/profile', 'My Profile'],
	['/dashboard/wishlist', 'Wishlist'],
	['/dashboard/offer', 'Make an offer'],
	['/dashboard/property-bought', 'Property bought'],
	['/dashboard/my-reviews', 'My reviews'],
	['/dashboard/add-property', 'Add Property'],
	['/dashboard/my-property', 'My Added Properties'],
	['/dashboard/agent-offer-properties', 'Requested Properties'],
	['/dashboard/sold-properties', 'My Sold Properties'],
	['/dashboard/manage-properties', 'Manage Properties'],
	['/dashboard/manage-users', 'Manage Users'],
	['/dashboard/manage-reviews', 'Manage Reviews'],
	['/dashboard/advertise-property', 'Advertise Property'],
	['/dashboard/payments', 'Payments'],
	['/dashboard/payment-success', 'Payment'],
	['/dashboard', 'Dashboard'],
];

function titleFor(pathname) {
	const match = titles.find(([path]) =>
		path === '/dashboard' ? pathname === path : pathname.startsWith(path),
	);
	return match ? match[1] : 'Dashboard';
}

export default function DashboardLayout() {
	useDynamicTitle();
	const { pathname } = useLocation();

	return (
		<SidebarProvider>
			<AppSidebar />
			<div className='flex min-h-svh w-full min-w-0 flex-col bg-background'>
				<header className='sticky top-0 z-30 flex min-h-16 items-center gap-3 border-b border-border bg-paper px-4'>
					<SidebarTrigger />
					<div>
						<p className='text-sm text-muted-foreground'>Dashboard</p>
						<h1 className='text-xl font-semibold leading-tight'>
							{titleFor(pathname)}
						</h1>
					</div>
				</header>
				<div className='min-w-0 flex-1 p-4 md:p-6'>
					<Outlet />
				</div>
			</div>
		</SidebarProvider>
	);
}
