const admin = require('firebase-admin');

function initializeFirebase() {
	try {
		const serviceAccount = require('../firebase-config.json');
		admin.initializeApp({
			credential: admin.credential.cert(serviceAccount),
		});
		console.log('Firebase Admin initialized successfully');
	} catch (error) {
		console.error('Error initializing Firebase Admin:', error);
		throw error;
	}
}

module.exports = {
	initializeFirebase,
	admin,
};
