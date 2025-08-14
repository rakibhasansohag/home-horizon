const express = require('express');
const router = express.Router();
const { getCollection } = require('../config/db');
const { verifyFireBaseToken, verifyRole } = require('../middlewares/auth');
const { ObjectId } = require('mongodb');

// Add to wishlist (user)
router.post(
	'/',
	verifyFireBaseToken,
	verifyRole(['user']),
	async (req, res) => {
		try {
			const { userId, propertyId } = req.body;
			if (!userId || !propertyId)
				return res.status(400).send({ error: 'Missing required fields' });

			const Wishlist = getCollection('wishlist');
			const existing = await Wishlist.findOne({ userId, propertyId });
			if (existing)
				return res.status(400).send({ error: 'Item already in wishlist' });

			await Wishlist.insertOne({
				userId,
				propertyId,
				createdAt: new Date().toISOString(),
			});
			res.send({ success: true });
		} catch (err) {
			console.error('wishlist.post error', err);
			res.status(500).send({ error: 'Internal server error' });
		}
	},
);

// Get wishlist for user
router.get(
	'/',
	verifyFireBaseToken,
	verifyRole(['user', 'agent', 'admin']),
	async (req, res) => {
		try {
			const userId = req.query.userId;
			if (!userId) return res.status(400).send({ error: 'Missing userId' });
			const Wishlist = getCollection('wishlist');
			const list = await Wishlist.find({ userId })
				.sort({ createdAt: -1 })
				.toArray();
			res.send(list);
		} catch (err) {
			console.error('wishlist.get error', err);
			res.status(500).send({ error: 'Internal server error' });
		}
	},
);

// Remove from wishlist
router.delete(
	'/',
	verifyFireBaseToken,
	verifyRole(['user']),
	async (req, res) => {
		try {
			const { userId, propertyId } = req.query;
			if (!userId || !propertyId)
				return res.status(400).send({ error: 'Missing required fields' });
			const Wishlist = getCollection('wishlist');
			const result = await Wishlist.deleteOne({ userId, propertyId });
			if (result.deletedCount === 0)
				return res.status(404).send({ error: 'Item not found in wishlist' });
			res.send({ success: true });
		} catch (err) {
			console.error('wishlist.delete error', err);
			res.status(500).send({ error: 'Internal server error' });
		}
	},
);

// Bulk fetch wishlist properties (ids)
router.post(
	'/properties',
	verifyFireBaseToken,
	verifyRole(['user']),
	async (req, res) => {
		try {
			const { propertyIds } = req.body;
			if (!Array.isArray(propertyIds))
				return res.status(400).send({ error: 'Invalid propertyIds' });
			const Properties = getCollection('properties');
			const objectIds = propertyIds.map((id) => new ObjectId(id));
			const properties = await Properties.find({
				_id: { $in: objectIds },
			}).toArray();
			res.send(properties);
		} catch (err) {
			console.error('wishlist.properties error', err);
			res.status(500).send({ error: 'Internal server error' });
		}
	},
);

module.exports = router;
