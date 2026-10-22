const express = require('express');

const router = express.Router();
const { getCollection } = require('../config/db');
const { withReviewCredits } = require('../utils/reviewCredits');

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

		res.send(await withReviewCredits(reviews));
	} catch (err) {
		console.error('legacy.latest-reviews error', err);
		res.status(500).send({ message: 'Failed to fetch latest reviews' });
	}
});

const CONTACT_TOPICS = ['buying', 'selling', 'offer', 'account', 'other'];

router.post('/contact', async (req, res) => {
	const body = req.body || {};
	const text = (value) => (typeof value === 'string' ? value.trim() : '');
	const name = text(body.name);
	const email = text(body.email).toLowerCase();
	const topic = text(body.topic);
	const message = text(body.message);

	// Hidden field that people never see; bots fill it in.
	if (text(body.website)) return res.status(201).send({ ok: true });

	if (name.length < 2 || name.length > 80) {
		return res.status(400).send({ message: 'Enter your name (2 to 80 characters).' });
	}
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) {
		return res.status(400).send({ message: 'Enter a valid email address.' });
	}
	if (!CONTACT_TOPICS.includes(topic)) {
		return res.status(400).send({ message: 'Choose what your message is about.' });
	}
	if (message.length < 10 || message.length > 2000) {
		return res
			.status(400)
			.send({ message: 'Write a message between 10 and 2000 characters.' });
	}

	const contactCollection = getCollection('contactMessages');
	try {
		const recent = await contactCollection.findOne({
			email,
			createdAt: { $gt: new Date(Date.now() - 60 * 1000) },
		});
		if (recent) {
			return res
				.status(429)
				.send({ message: 'You just sent a message. Wait a minute before sending another.' });
		}

		await contactCollection.insertOne({
			name,
			email,
			topic,
			message,
			status: 'new',
			createdAt: new Date(),
		});
		res.status(201).send({ ok: true });
	} catch (err) {
		console.error('public.contact error', err);
		res.status(500).send({ message: 'Could not save your message.' });
	}
});

module.exports = router;
