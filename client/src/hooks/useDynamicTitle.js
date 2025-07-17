// hooks/useDynamicTitle.js
import { useLocation } from 'react-router';
import { useEffect } from 'react';

const baseTitle = 'HomeHorizon';

const useDynamicTitle = () => {
	const location = useLocation();

	useEffect(() => {
		const path = location.pathname;
		let pageTitle = 'Page';

		if (path === '/') pageTitle = 'Home';
		else if (path.startsWith('/auth/login')) pageTitle = 'Login';
		else if (path.startsWith('/auth/register')) pageTitle = 'Register';
		else if (path === '/dashboard') pageTitle = 'Dashboard';
		else if (path.includes('add-property')) pageTitle = 'Add Property';
		else if (path.includes('my-property')) pageTitle = 'My Properties';
		else if (path.includes('wishlist')) pageTitle = 'Wishlist';
		else if (path.includes('offer')) pageTitle = 'Make Offer';
		else if (path.includes('property-bought')) pageTitle = 'Property Bought';
		else if (path.includes('manage-properties'))
			pageTitle = 'Manage Properties';
		else if (path.includes('advertise-property'))
			pageTitle = 'Advertise Property';
		else if (path.includes('all-properties')) pageTitle = 'All Properties';
		else if (path.includes('payment-success')) pageTitle = 'Payment Success';
		else if (path.includes('manage-users')) pageTitle = 'Manage Users';
		else if (path.includes('manage-reviews')) pageTitle = 'Manage Reviews';
		else if (path.includes('agent-offer-properties'))
			pageTitle = 'Agent Offers';
		else if (path.includes('sold-properties')) pageTitle = 'Sold Properties';
		else if (path.includes('my-reviews')) pageTitle = 'My Reviews';
		else if (path.includes('profile')) pageTitle = 'Profile';
		else if (path.includes('/unauthorized') || path.includes('/forbidden'))
			pageTitle = 'Unauthorized';
		else pageTitle = '404 Not Found';

		document.title = `${pageTitle} | ${baseTitle}`;
	}, [location]);
};

export default useDynamicTitle;
