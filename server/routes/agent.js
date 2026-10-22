const express = require('express');
const router = express.Router();

const { getCollection } = require('../config/db');

const { verifyFireBaseToken, verifyRole } = require('../middlewares/auth');
const { ObjectId } = require('mongodb');
const {
	wantsPage,
	readPage,
	searchPattern,
	monthBounds,
	matchingHomeIds,
	paged,
	sumField,
} = require('../utils/pageList');
const { attachHomes } = require('../utils/attachHomes');

// All routes require agent role
router.use(verifyFireBaseToken, verifyRole(['agent']));

// GET /api/v1/agent/offers  -> offers for this agent
router.get('/offers', async (req, res) => {
	try {
		const agentId = req.decoded.uid;
		const Offer = getCollection('offers');
		const filter = { agentId };
		const status = String(req.query.filter || 'all');
		if (['pending', 'accepted', 'rejected', 'bought'].includes(status)) {
			filter.status = status;
		}
		const pattern = searchPattern(req.query.q);
		if (pattern) {
			const homeIds = await matchingHomeIds(pattern);
			filter.$or = [
				{ buyerName: pattern },
				{ buyerEmail: pattern },
				{ propertyTitle: pattern },
				{ propertyId: { $in: homeIds } },
			];
		}
		if (!wantsPage(req.query)) {
			const offers = await Offer.find(filter).sort({ createdAt: -1 }).toArray();
			return res.send(await attachHomes(offers));
		}
		const amount = await sumField(Offer, filter, 'offerAmount');
		const result = await paged(Offer, filter, {
			...readPage(req.query),
			sort: { createdAt: -1 },
		});
		result.items = await attachHomes(result.items);
		result.amount = amount;
		res.send(result);
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
		const filter = { agentId, status: 'bought' };
		if (String(req.query.filter || 'all') === 'month') {
			filter.paidAt = monthBounds();
		}
		const pattern = searchPattern(req.query.q);
		if (pattern) {
			const homeIds = await matchingHomeIds(pattern);
			filter.$or = [
				{ buyerName: pattern },
				{ buyerEmail: pattern },
				{ propertyTitle: pattern },
				{ propertyId: { $in: homeIds } },
			];
		}
		if (!wantsPage(req.query)) {
			const soldOffers = await Offer.find(filter).sort({ paidAt: -1 }).toArray();
			return res.send(await attachHomes(soldOffers));
		}
		const amount = await sumField(Offer, filter, 'offerAmount');
		const result = await paged(Offer, filter, {
			...readPage(req.query),
			sort: { paidAt: -1 },
		});
		result.items = await attachHomes(result.items);
		result.amount = amount;
		res.send(result);
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
		const filter = { agentId };
		const status = String(req.query.filter || 'all');
		if (['pending', 'verified', 'rejected'].includes(status)) {
			filter.verificationStatus = status;
		}
		const pattern = searchPattern(req.query.q);
		if (pattern) {
			filter.$or = [{ title: pattern }, { location: pattern }];
		}
		if (!wantsPage(req.query)) {
			const myProperties = await Properties.find(filter)
				.sort({ createdAt: -1 })
				.toArray();
			return res.send(myProperties);
		}
		res.send(
			await paged(Properties, filter, {
				...readPage(req.query),
				sort: { createdAt: -1 },
			}),
		);
	} catch (error) {
		console.error('Error fetching my properties:', error);
		res.status(500).send({ error: 'Internal Server Error' });
	}
});

module.exports = router;
