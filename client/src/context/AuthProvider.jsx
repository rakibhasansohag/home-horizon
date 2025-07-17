import { auth } from '../firebaes/firebase.init';
import {
	createUserWithEmailAndPassword,
	GoogleAuthProvider,
	onAuthStateChanged,
	sendPasswordResetEmail,
	signInWithEmailAndPassword,
	signInWithPopup,
	signOut,
	updateProfile,
} from 'firebase/auth';

import { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';

const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	const logOut = () => {
		setLoading(true);
		return signOut(auth);
	};

	const createUser = (email, password) => {
		setLoading(true);
		return createUserWithEmailAndPassword(auth, email, password);
	};

	const signIn = (email, password) => {
		return signInWithEmailAndPassword(auth, email, password);
	};

	const signInWithGoogle = () => {
		setLoading(true);
		const provider = new GoogleAuthProvider();
		return signInWithPopup(auth, provider);
	};

	const updateUserProfile = (updatedData) => {
		setLoading(true);
		return updateProfile(auth.currentUser, updatedData);
	};

	const sendPasswordResetEmailHelper = (email) => {
		setLoading(true);
		return sendPasswordResetEmail(auth, email);
	};

	// to know the current user state
	useEffect(() => {
		setLoading(true);
		const unSubscribe = onAuthStateChanged(auth, (currentUser) => {
			setUser(currentUser);
			setLoading(false);

			if (currentUser?.email) {
				const userData = { email: currentUser.email };
				console.log(userData);
			}
		});

		return () => {
			unSubscribe();
		};
	}, []);

	const userInfo = {
		createUser,
		signIn,
		user,
		logOut,
		setUser,
		loading,
		setLoading,
		signInWithGoogle,
		updateUserProfile,
		sendPasswordResetEmailHelper,
	};
	return <AuthContext value={userInfo}>{children}</AuthContext>;
};

export default AuthProvider;
