import React from 'react';
import { Link } from 'react-router';

function Forbidden() {
	return (
		<div className='flex items-center justify-center min-h-screen bg-muted'>
			<div className='text-center'>
				<h1 className='text-6xl font-bold text-danger mb-4'>403</h1>
				<h2 className='text-2xl font-semibold text-ink'>
					Access Forbidden
				</h2>
				<p className='text-ink-muted mt-2'>
					You do not have permission to view this page.
				</p>
				<Link
					to='/'
					className=' block mt-6 px-4 py-2 bg-brand text-white rounded hover:bg-brand/90'
				>
					Go Back Home
				</Link>
			</div>
		</div>
	);
}

export default Forbidden;
