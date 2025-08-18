import { createBrowserRouter } from 'react-router';
import Home from '../pages/Home';
import HomeLayout from '../layouts/HomeLayout';
import AuthLayout from '../layouts/AuthLayout';

import Register from '../pages/Authentication/Register';
import DashboardLayout from '../layouts/DashboardLayout';
import Dashboard from '../pages/Dashboard';
import PrivateRoute from '../route/PrivateRoute';
import AddProperties from '../pages/Dashboard/AddProperties';
import Profile from '../pages/Dashboard/Profile';
import MyProperties from '../pages/Dashboard/MyProperties';
import AdminManageProperties from '../pages/Dashboard/AdminManageProperties';
import AdminManageUsers from '../pages/Dashboard/AdminManageUsers';
import AllProperties from '../pages/AllProperties';
import PropertyDetails from '../pages/PropertyDetails';
import MyWishlist from '../pages/Dashboard/MyWishList';
import MakeOffer from '../pages/Dashboard/MakeOffer';
import PropertyBought from '../pages/Dashboard/PropertyBought';
import MyReviews from '../pages/Dashboard/MyReviews';
import AgentOffers from '../pages/Dashboard/AgentOffers';
import PaymentSuccess from '../pages/Dashboard/Payment/Payment-success';
import AgentSoldProperties from '../pages/Dashboard/AgentSoldeProperties';
import AdminManageReviews from '../pages/Dashboard/AdminManageReviews';
import ProtectedDashboardRoute from '../route/ProtectedDashboardRoute';
import Forbidden from '../components/Shared/NotFound/Forbidden';
import Login from '../pages/Authentication/Login';
import NotFoundPage from '../components/Shared/NotFound/NotFoundPage';
import AdminAdvertiseProperty from '../pages/Dashboard/AdminAdvertiseProperty';
import ComingSoonPaymentPage from '../components/Shared/NotFound/ComingSoonPayment';

const router = createBrowserRouter([
	{
		path: '/',
		element: <HomeLayout />,
		children: [
			{
				path: '',
				Component: Home,
				index: true,
			},
			{
				path: 'all-properties',
				Component: AllProperties,
			},
			{
				path: 'all-properties/:id',
				element: (
					<PrivateRoute>
						<PropertyDetails />
					</PrivateRoute>
				),
			},
		],
	},
	{
		path: '/auth',
		Component: AuthLayout,
		children: [
			{
				path: 'login',
				Component: Login,
			},
			{
				path: 'register',
				Component: Register,
			},
		],
	},
	{
		path: '/dashboard',
		element: (
			<PrivateRoute>
				<DashboardLayout />
			</PrivateRoute>
		),
		children: [
			{
				path: '',
				Component: Dashboard,
				index: true,
			},
			{
				path: 'profile',
				Component: Profile,
			},
			{
				path: 'wishlist',
				Component: MyWishlist,
			},
			{
				path: 'offer/:propertyId',
				element: <MakeOffer />,
			},
			{
				path: 'property-bought',
				Component: PropertyBought,
			},
			{
				path: 'my-reviews',
				Component: MyReviews,
			},

			//  AGENT ONLY
			{
				element: <ProtectedDashboardRoute allowedRoles={['agent']} />,
				children: [
					{
						path: 'add-property',
						Component: AddProperties,
					},
					{
						path: 'my-property',
						Component: MyProperties,
					},
					{
						path: 'agent-offer-properties',
						Component: AgentOffers,
					},
					{
						path: 'sold-properties',
						Component: AgentSoldProperties,
					},
				],
			},

			//  ADMIN ONLY
			{
				element: <ProtectedDashboardRoute allowedRoles={['admin']} />,
				children: [
					{
						path: 'manage-properties',
						Component: AdminManageProperties,
					},
					{
						path: 'manage-users',
						Component: AdminManageUsers,
					},
					{
						path: 'manage-reviews',
						Component: AdminManageReviews,
					},
					{
						path: 'advertise-property',
						Component: AdminAdvertiseProperty,
					},
					{
						path: 'payments',
						Component: ComingSoonPaymentPage,
					},
				],
			},

			//  Anyone logged in (user/agent/admin)
			{
				path: 'payment-success',
				Component: PaymentSuccess,
			},
		],
	},
	{
		path: '/forbidden',
		Component: Forbidden,
	},
	{
		path: '/unauthorized',
		Component: Forbidden,
	},

	{
		path: '/*',
		element: <NotFoundPage />,
	},
]);

export default router;
