import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import { toast } from 'react-toastify';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';

export default function PaymentSuccess() {
	const [params] = useSearchParams();
	const sessionId = params.get('session_id');
	const axiosSecure = useAxiosSecure();
	const navigate = useNavigate();

	const { mutate } = useMutation({
		mutationFn: async () => {
			const res = await axiosSecure.post('/payments/verify', { sessionId });
			return res.data;
		},

		onSuccess: () => {
			toast.success('Payment successful');

			navigate(`/dashboard/property-bought`);
		},
		onError: () =>
			toast.error('Payment verification failed. Please contact support.'),
	});

	useEffect(() => {
		if (sessionId) mutate();
	}, [sessionId]);

	return (
		<div className='w-full flex flex-col items-center justify-center space-y-4 min-h-[50vh]'>
			<motion.div
				initial={{ scale: 0 }}
				animate={{ scale: 1 }}
				transition={{ duration: 0.5, type: 'spring' }}
				className='text-green-500'
			>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					className='h-20 w-20'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
					strokeWidth={2}
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M5 13l4 4L19 7'
					/>
				</svg>
			</motion.div>
			<p className='text-2xl font-bold text-center text-green-600'>
				Payment Successful!
			</p>
		</div>
	);
}
