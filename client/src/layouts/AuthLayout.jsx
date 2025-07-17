import { Outlet } from 'react-router';
import AuthImage from '../assets/auth.jpg';
import useDynamicTitle from '../hooks/useDynamicTitle';

function AuthLayout() {
	useDynamicTitle();
	return (
		<div className='bg-background  flex items-center justify-center'>
			<div className='grid grid-cols-1 md:grid-cols-[550px_1fr] w-full mx-auto h-screen'>
				{/* Outlet Section */}
				<div className='w-full  flex justify-center items-center px-4 sm:px-8 md:px-12 py-8'>
					<div className='w-full max-w-md'>
						<Outlet />
					</div>
				</div>

				{/* Image Section */}
				<div className='hidden md:block h-full max-h-screen overflow-hidden'>
					<img
						src={AuthImage}
						className='w-full h-full object-cover mx-auto'
						alt='Authentication background'
					/>
				</div>
			</div>
		</div>
	);
}

export default AuthLayout;
