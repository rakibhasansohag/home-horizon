import React from 'react';
import useAuth from '../hooks/useAuth';

import { Navigate, useLocation } from 'react-router';
import GlobalLoading from '../components/Shared/GlobalLoading';

function PrivateRoute({ children }) {
	const { user, loading } = useAuth();
	const location = useLocation();

	if (loading) {
		return <GlobalLoading />;
	}

	if (!user) {
		return <Navigate state={{ from: location.pathname }} to={'/auth/login'} />;
	}

	return children;
}

export default PrivateRoute;
