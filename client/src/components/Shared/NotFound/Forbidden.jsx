import React from 'react';
import { Link } from 'react-router';

function Forbidden() {
	return (
		<div className='flex items-center justify-center min-h-screen bg-gray-100'>
			<div className='text-center'>
				<h1 className='text-6xl font-bold text-red-600 mb-4'>403</h1>
				<h2 className='text-2xl font-semibold text-gray-800'>
					Access Forbidden
				</h2>
				<p className='text-gray-600 mt-2'>
					You do not have permission to view this page.
				</p>
				<Link
					to='/'
					className=' block mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
				>
					Go Back Home
				</Link>
			</div>
		</div>
	);
}

export default Forbidden;
