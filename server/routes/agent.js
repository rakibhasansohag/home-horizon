const express = require('express');
const router = express.Router();

const { getCollection } = require('../config/db');

const { verifyFireBaseToken, verifyRole } = require('../middlewares/auth');
const { ObjectId } = require('mongodb');

// All routes require agent role
router.use(verifyFireBaseToken, verifyRole(['agent']));

// GET /api/v1/agent/offers  -> offers for this agent
router.get('/offers', async (req, res) => {
	try {
		const agentId = req.decoded.uid;
		const Offer = getCollection('offers');
		const offers = await Offer.find({ agentId })
			.sort({ createdAt: -1 })
			.toArray();
		res.send(offers);
	} catch (err) {
		console.error('agent.offers error', err);
		res.status(500).send({ error: 'Internal server error' });
	}
});

// PATCH /api/v1/agent/offers/:id/status  -> accept/reject
router.patch('/offers/:id/status', async (req, res) => {
	try {
		const offerId = req.params.id;
		const { status, propertyId } = req.body;
		if (!['accepted', 'rejected'].includes(status))
			return res.status(400).send({ error: 'Invalid status' });
		if (!propertyId)
			return res.status(400).send({ error: 'Missing propertyId' });

		const Offer = getCollection('offers');
		const Properties = getCollection('properties');

		// Update selected offer
		await Offer.updateOne(
			{ _id: new ObjectId(offerId) },
			{ $set: { status, updatedAt: new Date().toISOString() } },
		);

		// Update property status field
		await Properties.updateOne(
			{ _id: new ObjectId(propertyId) },
			{ $set: { status } },
		);

		// If accepted: reject other offers for the same property
		if (status === 'accepted') {
			await Offer.updateMany(
				{ propertyId, _id: { $ne: new ObjectId(offerId) } },
				{ $set: { status: 'rejected', updatedAt: new Date().toISOString() } },
			);
		}

		res.send({ success: true });
	} catch (err) {
		console.error('agent.offers.patch error', err);
		res.status(500).send({ error: 'Internal server error' });
	}
});

// GET /api/v1/agent/sold-properties
router.get('/sold-properties', async (req, res) => {
	try {
		const agentId = req.decoded.uid;
		const Offer = getCollection('offers');
		const Properties = getCollection('properties');

		const soldOffers = await Offer.find({ agentId, status: 'bought' })
			.sort({ paidAt: -1 })
			.toArray();
		const propertyIds = soldOffers.map((o) => new ObjectId(o.propertyId));
		const properties = await Properties.find({
			_id: { $in: propertyIds },
		}).toArray();

		const enriched = soldOffers.map((offer) => {
			const prop = properties.find(
				(p) => p._id.toString() === offer.propertyId,
			);
			return {
				...offer,
				propertyTitle: prop?.title || 'N/A',
				propertyLocation: prop?.location || 'N/A',
			};
		});

		res.send(enriched);
	} catch (err) {
		console.error('agent.sold-properties error', err);
		res.status(500).send({ error: 'Internal server error' });
	}
});

// Get My Properties (by agentId/ uid)
router.get('/my-properties', async (req, res) => {
	try {
		const agentId = req.decoded.uid;

		const Properties = getCollection('properties');
		const myProperties = await Properties.find({ agentId })
			.sort({ createdAt: -1 }) // newest first
			.toArray();
		res.send(myProperties);
	} catch (error) {
		console.error('Error fetching my properties:', error);
		res.status(500).send({ error: 'Internal Server Error' });
	}
});

module.exports = router;
