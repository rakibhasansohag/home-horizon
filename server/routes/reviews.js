const express = require('express');
const router = express.Router();
const { getCollection } = require('../config/db');
const { verifyFireBaseToken } = require('../middlewares/auth');
const { ObjectId } = require('mongodb');

// POST /api/v1/reviews
router.post('/', verifyFireBaseToken, async (req, res) => {
	try {
		const Review = getCollection('reviews');
		const result = await Review.insertOne({
			...req.body,
			createdAt: new Date().toISOString(),
		});
		res.status(201).send(result);
	} catch (err) {
		console.error('reviews.post error', err);
		res.status(500).send({ error: 'Internal server error' });
	}
});

// GET /api/v1/reviews/my
router.get('/my', verifyFireBaseToken, async (req, res) => {
	try {
		const { uid } = req.query;
		console.log(uid);

		// if (!uid) return res.status(400).send({ error: 'Missing uid' });

		const Review = getCollection('reviews');

		console.log(Review);

		const reviews = await Review.find({ userId: uid }).toArray();
		console.log(reviews);
		res.send(reviews);
	} catch (err) {
		console.error('reviews.my error', err);
		res.status(500).send({ error: 'Internal server error' });
	}
});

// GET /api/v1/reviews/:propertyId
router.get('/:propertyId', verifyFireBaseToken, async (req, res) => {
	try {
		const propertyId = req.params.propertyId;
		const Review = getCollection('reviews');
		const reviews = await Review.find({ propertyId }).toArray();
		res.send(reviews);
	} catch (err) {
		console.error('reviews.get error', err);
		res.status(500).send({ error: 'Internal server error' });
	}
});

// DELETE /api/v1/reviews/:id
router.delete('/:id', verifyFireBaseToken, async (req, res) => {
	try {
		const id = req.params.id;
		const Review = getCollection('reviews');
		const result = await Review.deleteOne({ _id: new ObjectId(id) });
		res.send({ success: result.deletedCount > 0 });
	} catch (err) {
		console.error('reviews.delete error', err);
		res.status(500).send({ error: 'Internal server error' });
	}
});

module.exports = router;
