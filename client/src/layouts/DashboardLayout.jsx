import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import Header from '../components/shared/Header';
import { Outlet } from 'react-router';
import useDynamicTitle from '../hooks/useDynamicTitle';

export default function DashboardLayout() {
	useDynamicTitle();
	return (
		<section>
			<div>{/* <Header /> */}</div>
			<main>
				<SidebarProvider className={'relative'}>
					<AppSidebar />
					<main className='md:flex gap-2 min-h-screen w-full mb-12'>
						<SidebarTrigger className={'mt-5 '} />
						<Outlet />
					</main>
				</SidebarProvider>
			</main>
		</section>
	);
}
