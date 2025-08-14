const express = require('express');
const router = express.Router();
const { getCollection } = require('../config/db');
const { verifyFireBaseToken, verifyRole } = require('../middlewares/auth');
const { ObjectId } = require('mongodb');
const seedGenerator = require('../utils/seedProperties');

router.use(verifyFireBaseToken, verifyRole(['admin', 'super-admin']));

// Get all properties
router.get('/properties', async (req, res) => {
	try {
		const Properties = getCollection('properties');
		const properties = await Properties.find({})
			.sort({ createdAt: -1 })
			.toArray();
		res.send(properties);
	} catch (err) {
		console.error('admin.properties error', err);
		res.status(500).send({ error: 'Internal server error' });
	}
});

// Verify property
router.patch('/properties/verify/:id', async (req, res) => {
	try {
		const id = req.params.id;
		const Properties = getCollection('properties');
		const result = await Properties.updateOne(
			{ _id: new ObjectId(id) },
			{
				$set: {
					verificationStatus: 'verified',
					updatedAt: new Date().toISOString(),
				},
			},
		);
		if (result.modifiedCount === 0)
			return res.status(404).send({ error: 'Not found' });
		res.send({ message: 'Property verified' });
	} catch (err) {
		console.error('admin.verify error', err);
		res.status(500).send({ error: 'Internal server error' });
	}
});

// Reject property
router.patch('/properties/reject/:id', async (req, res) => {
	try {
		const id = req.params.id;
		const Properties = getCollection('properties');
		const result = await Properties.updateOne(
			{ _id: new ObjectId(id) },
			{
				$set: {
					verificationStatus: 'rejected',
					updatedAt: new Date().toISOString(),
				},
			},
		);
		if (result.modifiedCount === 0)
			return res.status(404).send({ error: 'Not found' });
		res.send({ message: 'Property rejected' });
	} catch (err) {
		console.error('admin.reject error', err);
		res.status(500).send({ error: 'Internal server error' });
	}
});

// Get users
router.get('/users', async (req, res) => {
	try {
		const Users = getCollection('users');
		const users = await Users.find({}).sort({ last_log_in: -1 }).toArray();
		res.send(users);
	} catch (err) {
		console.error('admin.users error', err);
		res.status(500).send({ error: 'Internal server error' });
	}
});

// update user role by _id
router.patch('/users/:id/role', async (req, res) => {
	try {
		const id = req.params.id;
		const { role } = req.body;
		const Users = getCollection('users');
		await Users.updateOne({ _id: new ObjectId(id) }, { $set: { role } });
		res.send({ success: true });
	} catch (err) {
		console.error('admin.users.role error', err);
		res.status(500).send({ error: 'Internal server error' });
	}
});

// mark agent fraud (set role=fraud + delete agent props)
router.patch('/users/:id/fraud', async (req, res) => {
	try {
		const id = req.params.id;
		const { uid } = req.body; // agent uid
		const Users = getCollection('users');
		const Properties = getCollection('properties');
		await Users.updateOne(
			{ _id: new ObjectId(id) },
			{ $set: { role: 'fraud' } },
		);
		await Properties.deleteMany({ agentId: uid });
		res.send({ success: true });
	} catch (err) {
		console.error('admin.users.fraud error', err);
		res.status(500).send({ error: 'Internal server error' });
	}
});

// delete user (db + firebase)
router.delete('/users/:id', async (req, res) => {
	try {
		const id = req.params.id;
		const Users = getCollection('users');
		const user = await Users.findOne({ _id: new ObjectId(id) });
		if (!user) return res.status(404).send({ error: 'User not found' });

		await Users.deleteOne({ _id: user._id });
		// also delete from Firebase Auth
		const admin = require('../firebaseAdmin');
		await admin.auth().deleteUser(user.uid);
		res.send({ success: true });
	} catch (err) {
		console.error('admin.users.delete error', err);
		res.status(500).send({ error: 'Internal server error' });
	}
});

// seed properties (admin)
router.post('/seed-properties', async (req, res) => {
	try {
		const Properties = getCollection('properties');
		const seed = seedGenerator();
		const result = await Properties.insertMany(seed);
		res.send({ success: true, inserted: result.insertedCount });
	} catch (err) {
		console.error('admin.seed error', err);
		res.status(500).send({ error: 'Seed failed' });
	}
});

// POST /api/v1/admin/reviews
router.get('/reviews', async (req, res) => {
	try {
		const Review = getCollection('reviews');
		const reviews = await Review.find({}).toArray();
		res.send(reviews);
	} catch (err) {
		console.error('reviews.post error', err);
		res.status(500).send({ error: 'Internal server error' });
	}
});

// GET all verified properties (only for admin)
router.get(
	'/verified-properties',

	async (req, res) => {
		try {
			const Properties = getCollection('properties');

			const properties = await Properties.find({
				verificationStatus: 'verified',
			})
				.sort({ createdAt: -1 })
				.toArray();

			res.send(properties);
		} catch (err) {
			console.error(err);
			res.status(500).send({ message: 'Error getting verified properties' });
		}
	},
);

// PATCH to advertise a property
router.patch(
	'/advertise-property/:id',

	async (req, res) => {
		try {
			const { id } = req.params;
			const Properties = getCollection('properties');

			const result = await Properties.updateOne(
				{ _id: new ObjectId(id) },
				{ $set: { isAdvertised: true } },
			);

			res.send(result);
		} catch (err) {
			console.error(err);
			res.status(500).send({ message: 'Error advertising property' });
		}
	},
);

// set isAdverties = false
router.patch(
	'/unadvertise-property/:id',

	async (req, res) => {
		try {
			const { id } = req.params;
			const Properties = getCollection('properties');

			const result = await Properties.updateOne(
				{ _id: new ObjectId(id) },
				{ $set: { isAdvertised: false } },
			);
			res.send(result);
		} catch (err) {
			console.error(err);
			res.status(500).send({ message: 'Error un‐advertising property' });
		}
	},
);
// GET advertise stats
router.get('/advertise-stats', async (req, res) => {
	try {
		const Properties = getCollection('properties');
		const total = await Properties.countDocuments({ isAdvertised: true });
		res.send({ total });
	} catch (err) {
		console.error(err);
		res.status(500).send({ message: 'Error fetching advertise stats' });
	}
});

module.exports = router;
