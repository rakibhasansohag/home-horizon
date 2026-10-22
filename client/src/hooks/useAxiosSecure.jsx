import axios from 'axios';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { auth } from '../firebaes/firebase.init';
import useAuth from './useAuth';

const axiosSecure = axios.create({
	baseURL: import.meta.env.VITE_BASE_URL + '/api/v1',
});

// Interceptors live at module level so they are registered exactly once.
// Registering them inside the hook stacked a new pair on every render.
let onAuthFailure = null;

axiosSecure.interceptors.request.use(async (config) => {
	await auth.authStateReady();
	const current = auth.currentUser;
	if (current) {
		const token = await current.getIdToken(config._forceRefresh === true);
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

axiosSecure.interceptors.response.use(
	(res) => res,
	async (error) => {
		const status = error.response?.status;
		const config = error.config;

		// The server answers 403 "Forbidden Access" when the token itself is rejected.
		const tokenRejected =
			status === 403 && error.response?.data?.error === 'Forbidden Access';
		if (tokenRejected && config && !config._forceRefresh && auth.currentUser) {
			return axiosSecure({ ...config, _forceRefresh: true });
		}

		if (status === 401 || tokenRejected) onAuthFailure?.('signed-out');
		else if (status === 403) onAuthFailure?.('forbidden');

		return Promise.reject(error);
	},
);

function useAxiosSecure() {
	const { logOut } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		onAuthFailure = (reason) => {
			if (reason === 'forbidden') {
				navigate('/forbidden');
				return;
			}
			logOut()
				.then(() => {
					toast.error('Your session expired. Please sign in again.', {
						toastId: 'session-expired',
					});
					navigate('/auth/login');
				})
				.catch((err) => console.log(err));
		};
	}, [logOut, navigate]);

	return axiosSecure;
}

export default useAxiosSecure;
