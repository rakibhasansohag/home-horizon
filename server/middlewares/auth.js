const admin = require('../firebaseAdmin');
const { getCollection } = require('../config/db');

async function verifyFireBaseToken(req, res, next) {
	const authHeader = req.headers.authorization;
	if (!authHeader)
		return res.status(401).send({ error: 'Unauthorized access' });

	const token = authHeader.split(' ')[1];
	if (!token || token === 'null')
		return res.status(401).send({ error: 'Unauthorized access' });

	try {
		const decoded = await admin.auth().verifyIdToken(token);
		req.decoded = decoded;
		next();
	} catch (err) {
		console.error('verifyFireBaseToken error', err);
		return res.status(403).send({ error: 'Forbidden Access' });
	}
}

function verifyRole(requiredRoles = []) {
	return async (req, res, next) => {
		try {
			const uid = req.decoded?.uid;
			if (!uid) return res.status(403).send({ error: 'Unauthorized' });

			const User = getCollection('users');
			const user = await User.findOne({ uid });

			if (!user || !requiredRoles.includes(user.role)) {
				return res.status(403).send({ error: 'Access denied' });
			}

			req.user = user;
			next();
		} catch (err) {
			console.error('verifyRole error', err);
			res.status(500).send({ error: 'Internal server error' });
		}
	};
}

module.exports = {
	verifyFireBaseToken,
	verifyRole,
};
