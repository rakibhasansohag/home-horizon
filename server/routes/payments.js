const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { getCollection } = require('../config/db');
const { verifyFireBaseToken } = require('../middlewares/auth');
const { ObjectId } = require('mongodb');

// POST /api/v1/payments/create-checkout-session
router.post(
	'/create-checkout-session',
	verifyFireBaseToken,
	async (req, res) => {
		try {
			const { offerId } = req.body;

			const uid = req.decoded.uid;
			if (!offerId)
				return res.status(400).send({ error: 'Offer ID is required' });

			const Offer = getCollection('offers');
			const OfferDoc = await Offer.findOne({ _id: new ObjectId(offerId) });

			if (!OfferDoc) return res.status(404).send({ error: 'Offer not found' });

			if (OfferDoc?.buyerId !== uid)
				return res.status(403).send({ error: 'Unauthorized access' });
			if (OfferDoc?.status !== 'accepted')
				return res.status(400).send({ error: 'Offer is not accepted' });

			const offerAmount =
				typeof OfferDoc?.offerAmount === 'string'
					? Number(OfferDoc?.offerAmount)
					: OfferDoc?.offerAmount;
			if (isNaN(offerAmount)) {
				return res.status(400).send({ error: 'Invalid offer amount' });
			}

			const successUrl = `${
				process.env.BASE_URL_NETLIFY || 'http://localhost:5173'
			}/dashboard/payment-success?session_id={CHECKOUT_SESSION_ID}`;
			const cancelUrl = `${
				process.env.BASE_URL_NETLIFY || 'http://localhost:5173'
			}/payment-cancelled`;

			const session = await stripe.checkout.sessions.create({
				payment_method_types: ['card'],
				line_items: [
					{
						price_data: {
							currency: 'bdt',
							product_data: { name: `Property: ${OfferDoc.propertyTitle}` },
							unit_amount: OfferDoc.offerAmount * 100,
						},
						quantity: 1,
					},
				],
				mode: 'payment',
				success_url: successUrl,
				cancel_url: cancelUrl,
				metadata: {
					offerId,
					buyerId: OfferDoc.buyerId,
					propertyId: OfferDoc.propertyId,
				},
			});

			res.send({ url: session.url });
		} catch (err) {
			console.error('payments.create error', err);
			res.status(500).send({ error: 'Internal server error' });
		}
	},
);

// POST /api/v1/payments/verify
router.post('/verify', async (req, res) => {
	try {
		const { sessionId } = req.body;
		const session = await stripe.checkout.sessions.retrieve(sessionId);
		if (session.payment_status !== 'paid')
			return res.status(400).send({ error: 'Payment not completed' });

		const { offerId } = session.metadata;
		const Offer = getCollection('offers');
		const Properties = getCollection('properties');

		await Offer.updateOne(
			{ _id: new ObjectId(offerId) },
			{
				$set: {
					isPaid: true,
					transactionId: session.payment_intent,
					amount: session.amount_total / 100,
					paidAt: new Date().toISOString(),
					updatedAt: new Date(),
					sessionId,
					status: 'bought',
				},
			},
		);

		const offer = await Offer.findOne({ _id: new ObjectId(offerId) });
		await Properties.updateOne(
			{ _id: new ObjectId(offer.propertyId) },
			{
				$set: { dealStatus: 'sold', updatedAt: new Date().toISOString() },
			},
		);

		res.send({ success: true });
	} catch (err) {
		console.error('payments.verify error', err);
		res.status(500).send({ error: 'Internal server error' });
	}
});

module.exports = router;
