import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css';
import { RouterProvider } from 'react-router';
import router from './router/router';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthProvider from './context/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ThemeProvider from './context/ThemeProvider';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// A 4xx answer will not change on retry; only retry network and server errors.
			retry: (failureCount, error) => {
				const status = error?.response?.status;
				if (status >= 400 && status < 500) return false;
				return failureCount < 2;
			},
		},
	},
});

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<ThemeProvider>
			<QueryClientProvider client={queryClient}>
				<AuthProvider>
					<RouterProvider router={router} />
					<ToastContainer
						position='top-right'
						autoClose={1500}
						pauseOnFocusLoss
						pauseOnHover
						closeButton
					/>
				</AuthProvider>
			</QueryClientProvider>
		</ThemeProvider>
	</StrictMode>,
);
