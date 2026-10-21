import { useEffect } from 'react';
import { Outlet, useNavigation, useLocation } from 'react-router';
import Header from '@/components/Shared/Header';
import Footer from '../components/Shared/Footer';
import useDynamicTitle from '../hooks/useDynamicTitle';

const HomeLayout = () => {
	const navigation = useNavigation();
	const location = useLocation();
	useDynamicTitle();

	const isLoading = navigation.state === 'loading';

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [location.pathname]);

	return (
		<div className='flex min-h-screen flex-col bg-background'>
			<Header />

			{isLoading && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-paper/80'>
					<span className='size-8 animate-spin rounded-full border-2 border-line border-t-brand' />
					<span className='sr-only'>Loading</span>
				</div>
			)}

			<main className='flex-1'>
				<Outlet />
			</main>

			<Footer />
		</div>
	);
};

export default HomeLayout;
