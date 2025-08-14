const express = require('express');
const router = express.Router();
const { getCollection } = require('../config/db');
const { verifyFireBaseToken } = require('../middlewares/auth');
const { ObjectId } = require('mongodb');

// POST /api/v1/users  — upsert user (do not overwrite existing role)
router.post('/', async (req, res) => {
	try {
		const userData = req.body;
		if (!userData.uid || !userData.email) {
			return res.status(400).send({ error: 'UID and email are required' });
		}

		const Users = getCollection('users');
		const existingUser = await Users.findOne({ uid: userData.uid });

		if (existingUser) {
			// update all except role
			const { role, ...rest } = userData;
			await Users.updateOne({ uid: userData.uid }, { $set: rest });
			return res.send({ message: 'User updated', role: existingUser.role });
		} else {
			const newUser = {
				...userData,
				role: 'user',
				location: userData.location || '',
				bloodGroup: userData.bloodGroup || '',
				address: userData.address || '',
			};
			await Users.insertOne(newUser);
			return res.send({ message: 'User created', role: 'user' });
		}
	} catch (err) {
		console.error('users.post error', err);
		res.status(500).send({ error: 'Internal server error' });
	}
});

// GET /api/v1/users/role?email=... or ?uid=...
// Protected: require firebase token (so requester's token validated)
router.get('/role', verifyFireBaseToken, async (req, res) => {
	try {
		const { email, uid } = req.query;
		if (!email && !uid)
			return res.status(400).send({ error: 'Email or UID required' });

		const Users = getCollection('users');
		let user = null;
		if (email) user = await Users.findOne({ email });
		if (!user && uid) user = await Users.findOne({ uid });

		if (!user) return res.status(404).send({ error: 'User not found' });

		res.send({ role: user.role || 'user' });
	} catch (err) {
		console.error('users.role error', err);
		res.status(500).send({ error: 'Internal server error' });
	}
});

// GET /api/v1/users/:uid  (profile) — protected; only yourself can fetch
router.get('/:uid', verifyFireBaseToken, async (req, res) => {
	try {
		const uid = req.params.uid;
		if (req.decoded.uid !== uid) {
			return res
				.status(403)
				.send({ error: 'Forbidden: You can only access your own profile' });
		}
		const Users = getCollection('users');
		const user = await Users.findOne({ uid });
		if (!user) return res.status(404).send({ error: 'user not found' });
		res.send(user);
	} catch (err) {
		console.error('users.get error', err);
		res.status(500).send({ error: 'Internal server error' });
	}
});

// PUT /api/v1/users/:uid — update by owner (protected)
router.put('/:uid', verifyFireBaseToken, async (req, res) => {
	try {
		const uid = req.params.uid;
		if (req.decoded.uid !== uid) {
			return res
				.status(403)
				.send({ error: 'Forbidden: You can only update your own profile' });
		}
		const updated = req.body;
		const Users = getCollection('users');
		const result = await Users.updateOne(
			{ uid },
			{ $set: updated, $currentDate: { lastUpdated: true } },
			{ upsert: false },
		);
		res.status(200).send({ message: 'Profile updated successfully', result });
	} catch (err) {
		console.error('users.put error', err);
		res.status(500).send({ error: 'Internal server error' });
	}
});

module.exports = router;
