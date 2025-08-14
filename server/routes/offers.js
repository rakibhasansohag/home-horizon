const express = require('express');
const router = express.Router();
const { getCollection } = require('../config/db');
const { verifyFireBaseToken, verifyRole } = require('../middlewares/auth');
const { ObjectId } = require('mongodb');

// POST /api/v1/offers  — submit an offer (user)
router.post(
	'/',
	verifyFireBaseToken,
	verifyRole(['user']),
	async (req, res) => {
		try {
			const Offer = getCollection('offers');
			const Wishlist = getCollection('wishlist');

			const {
				propertyId,
				agentId,
				agentName,
				propertyTitle,
				propertyLocation,
				minPrice,
				maxPrice,
				offerAmount,
				buyerId,
				buyerName,
				buyerEmail,
				buyingDate,
				updatedAt,
				propertyImage,
			} = req.body;

			if (
				!propertyId ||
				!agentId ||
				!offerAmount ||
				!buyerId ||
				!propertyTitle ||
				!propertyLocation
			) {
				return res.status(400).send({ error: 'Missing required fields' });
			}

			const existingOffer = await Offer.findOne({ propertyId, buyerId });
			if (existingOffer)
				return res.status(400).send({ error: 'You already made an offer' });

			if (offerAmount < minPrice || offerAmount > maxPrice) {
				return res
					.status(400)
					.send({ error: `Offer must be between ${minPrice} and ${maxPrice}` });
			}

			await Offer.insertOne({
				propertyId,
				propertyTitle,
				propertyLocation,
				agentId,
				agentName,
				minPrice,
				maxPrice,
				offerAmount,
				buyerId,
				buyerName,
				buyerEmail,
				buyingDate,
				status: 'pending',
				createdAt: new Date().toISOString(),
				updatedAt,
				propertyImage,
			});

			// remove from wishlist if present
			await Wishlist.deleteOne({ userId: buyerId, propertyId });

			res.send({ success: true });
		} catch (err) {
			console.error('offers.post error', err);
			res.status(500).send({ error: 'Internal server error' });
		}
	},
);

// GET /api/v1/offers?email= - get offers by buyer email (user)
router.get('/', verifyFireBaseToken, verifyRole(['user']), async (req, res) => {
	try {
		const { email } = req.query;
		if (!email) return res.status(400).send({ error: 'Missing email' });

		const Offer = getCollection('offers');
		const offers = await Offer.find({ buyerEmail: email }).toArray();
		res.send(offers);
	} catch (err) {
		console.error('offers.get error', err);
		res.status(500).send({ error: 'Internal server error' });
	}
});

// GET /api/v1/offers/user?email=&propertyId=  -> one offer
router.get('/user', verifyFireBaseToken, async (req, res) => {
	try {
		const { email, propertyId } = req.query;
		const Offer = getCollection('offers');
		const offer = await Offer.findOne({ buyerEmail: email, propertyId });
		res.send(offer);
	} catch (err) {
		console.error('offers.user error', err);
		res.status(500).send({ error: 'Internal server error' });
	}
});

module.exports = router;
