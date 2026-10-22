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

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AuthContext } from './AuthContext';

const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const queryClient = useQueryClient();
	const lastUid = useRef(null);

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
			const uid = currentUser?.uid ?? null;
			// Cached answers belong to the previous account; drop them on logout or switch.
			if (lastUid.current && lastUid.current !== uid) queryClient.clear();
			lastUid.current = uid;

			setUser(currentUser);
			setLoading(false);
		});

		return () => {
			unSubscribe();
		};
	}, [queryClient]);

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
