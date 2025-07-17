import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function useAuth() {
	const authInfo = useContext(AuthContext);
	return authInfo;
}

export default useAuth;
