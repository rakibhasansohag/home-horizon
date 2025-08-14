const express = require('express');

const router = express.Router();
const { getCollection } = require('../config/db');

router.get('/advertised-properties', async (req, res) => {
	const propertiesCollection = getCollection('properties');
	try {
		const limit = parseInt(req.query.limit, 10) || 4;

		const properties = await propertiesCollection
			.find({ isAdvertised: true })
			.sort({ createdAt: -1 })
			.limit(limit)
			.toArray();

		res.send(properties);
	} catch (err) {
		console.error('legacy.advertised-properties error', err);
		res.status(500).send({ message: 'Failed to fetch advertised properties' });
	}
});

router.get('/latest-reviews', async (req, res) => {
	const reviewCollection = getCollection('reviews');
	try {
		const limit = parseInt(req.query.limit, 10) || 3;

		const reviews = await reviewCollection
			.find({})
			.sort({ createdAt: -1 })
			.limit(limit)
			.toArray();

		res.send(reviews);
	} catch (err) {
		console.error('legacy.latest-reviews error', err);
		res.status(500).send({ message: 'Failed to fetch latest reviews' });
	}
});

module.exports = router;
