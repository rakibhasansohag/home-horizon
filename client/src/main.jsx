import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css';
import { RouterProvider } from 'react-router';
import router from './router/router';
import { Bounce, ToastContainer } from 'react-toastify';
import AuthProvider from './context/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ThemeProvider from './context/ThemeProvider';

// Client for query
const queryClient = new QueryClient();

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
						transition={Bounce}
					/>
				</AuthProvider>
			</QueryClientProvider>
		</ThemeProvider>
	</StrictMode>,
);
