import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import { toast } from 'react-toastify';
import { Check } from 'lucide-react';

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
		<div className='flex min-h-[50vh] w-full flex-col items-center justify-center space-y-3'>
			<Check className='size-12 text-success' aria-hidden='true' />
			<p className='text-center text-2xl font-semibold text-success'>
				Payment successful
			</p>
			<p className='text-base text-muted-foreground'>
				Confirming your payment…
			</p>
		</div>
	);
}
