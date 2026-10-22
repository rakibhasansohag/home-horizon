import { Outlet } from 'react-router';
import AuthImage from '../assets/auth.jpg';
import { useRouteSeo } from '../hooks/useSeo';

function AuthLayout() {
	useRouteSeo();
	return (
		<div className='min-h-screen bg-paper'>
			<div className='grid min-h-screen grid-cols-1 md:grid-cols-2'>
				<div className='flex items-center justify-center overflow-y-auto px-4 py-10 sm:px-8'>
					<div className='w-full max-w-md'>
						<Outlet />
					</div>
				</div>
				<div className='hidden md:block'>
					<img
						src={AuthImage}
						className='h-full min-h-screen w-full object-cover'
						alt='Brick house with a white porch'
					/>
				</div>
			</div>
		</div>
	);
}

export default AuthLayout;
