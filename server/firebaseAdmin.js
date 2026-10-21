const admin = require('firebase-admin');
// Initialize Firebase Admin
const decoded = Buffer.from(process.env.FIREBASE_KEY, 'base64').toString();
const serviceAccount = JSON.parse(decoded);


if (!admin.apps.length) {
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount),
	});
}

module.exports = admin;
