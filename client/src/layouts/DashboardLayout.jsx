import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Outlet, useLocation } from 'react-router';
import { useRouteSeo } from '../hooks/useSeo';
import { dashboardTitle } from '@/lib/seo';

export default function DashboardLayout() {
	useRouteSeo();
	const { pathname } = useLocation();

	return (
		<SidebarProvider>
			<AppSidebar />
			<div className='flex min-h-svh min-w-0 flex-1 basis-0 flex-col bg-background'>
				<header className='sticky top-0 z-30 flex min-h-16 items-center gap-3 border-b border-border bg-paper px-4'>
					<SidebarTrigger />
					<div>
						<p className='text-sm text-muted-foreground'>Dashboard</p>
						<h1 className='text-xl font-semibold leading-tight'>
							{dashboardTitle(pathname)}
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
