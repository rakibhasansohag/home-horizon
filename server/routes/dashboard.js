const express = require('express');
const router = express.Router();
const { getCollection } = require('../config/db');
const { verifyFireBaseToken, verifyRole } = require('../middlewares/auth');
const { ObjectId } = require('mongodb');

/**
 * -- small helpers (keeps route code tidy & reusable) --
 */
async function findUserByUid(uid) {
	const Users = getCollection('users');
	return (
		(await Users.findOne({ uid })) ||
		(await Users.findOne({ firebaseUid: uid })) ||
		(await Users.findOne({ email: uid })) ||
		null
	);
}
function toNum(v) {
	const n = Number(v);
	return Number.isFinite(n) ? n : 0;
}

/**
 * Health
 */
router.get('/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

/**
 * USER dashboard - any authenticated user
 * GET /api/v1/dashboard/user
 */
router.get(
	'/user',
	verifyFireBaseToken,
	verifyRole(['user']),
	async (req, res) => {
		try {
			const uid = req.decoded?.uid;
			if (!uid) return res.status(401).send({ error: 'Unauthorized' });

			const Users = getCollection('users');
			const Properties = getCollection('properties');
			const Wishlist = getCollection('wishlist');
			const Offers = getCollection('offers');

			// Find user
			const userDoc = await findUserByUid(uid);

			// 1️ Bought properties (linked via offers: status=bought)
			const boughtOffers = await Offers.find({
				buyerId: uid,
				status: 'bought',
			}).toArray();

			const boughtIds = boughtOffers.map((o) => new ObjectId(o.propertyId));
			const boughtProperties = boughtIds.length
				? await Properties.find(
						{ _id: { $in: boughtIds } },
						{
							projection: {
								title: 1,
								images: 1,
								minPrice: 1,
								maxPrice: 1,
								location: 1,
								agentName: 1,
								status: 1,
							},
						},
				  ).toArray()
				: [];

			const boughtPropertiesWithOffers = boughtOffers.map((offer) => {
				const property = boughtProperties.find(
					(p) => p._id.toString() === offer.propertyId,
				);
				return {
					...property,
					...offer,
					_id: property._id,
				};
			});

			// 2️ Wishlist properties
			const wishlistItems = await Wishlist.find({ userId: uid }).toArray();
			const wishlistIds = wishlistItems.map(
				(item) => new ObjectId(item.propertyId),
			);
			const wishlistProperties = wishlistIds.length
				? await Properties.find(
						{ _id: { $in: wishlistIds } },
						{
							projection: {
								title: 1,
								images: 1,
								minPrice: 1,
								maxPrice: 1,
								location: 1,
								agentName: 1,
								status: 1,
							},
						},
				  ).toArray()
				: [];

			// 3️ Pending offers (status=pending) + merge property info
			const pendingOffersDocs = await Offers.find({
				buyerId: uid,
				status: 'pending',
			}).toArray();

			const pendingIds = pendingOffersDocs.map(
				(o) => new ObjectId(o.propertyId),
			);
			const pendingProperties = pendingIds.length
				? await Properties.find(
						{ _id: { $in: pendingIds } },
						{
							projection: {
								title: 1,
								images: 1,
								minPrice: 1,
								maxPrice: 1,
								location: 1,
								agentName: 1,
								status: 1,
							},
						},
				  ).toArray()
				: [];

			const pendingOffers = pendingOffersDocs.map((offer) => {
				const property = pendingProperties.find(
					(p) => p._id.toString() === offer.propertyId,
				);
				return {
					...offer,
					property,
				};
			});

			// 4️ Stats
			const totalSpent = boughtProperties.reduce(
				(sum, p) => sum + (p.maxPrice || 0),
				0,
			);

			// 5️ Response
			return res.json({
				user: {
					id: userDoc?._id || uid,
					name:
						userDoc?.name ||
						userDoc?.displayName ||
						req.decoded?.name ||
						'User',
					avatar: userDoc?.profilePic || userDoc?.photoURL || '',
					role: 'user',
				},
				stats: {
					boughtCount: boughtProperties.length,
					wishlistCount: wishlistProperties.length,
					pendingOffers: pendingOffers.length,
					totalSpent,
				},
				boughtProperties: boughtPropertiesWithOffers,
				wishlistProperties,
				pendingOffers,
			});
		} catch (err) {
			console.error('dashboard.user error', err);
			return res.status(500).send({ error: 'Internal server error' });
		}
	},
);

/**
 * AGENT dashboard - only agent
 * GET /api/v1/dashboard/agent
 * (uses same pattern - will be useful later)
 */
router.get(
	'/agent',
	verifyFireBaseToken,
	verifyRole(['agent']),
	async (req, res) => {
		try {
			const uid = req.decoded?.uid;
			if (!uid) return res.status(401).send({ error: 'Unauthorized' });

			const Users = getCollection('users');
			const Properties = getCollection('properties');
			const Offers = getCollection('offers');
			const Transactions = getCollection('transactions'); // optional

			const userDoc = await findUserByUid(uid);
			const agentId = userDoc?._id || uid;

			const listings = await Properties.find({
				$or: [{ agentUid: uid }, { agentId }],
			})
				.project({ title: 1, minPrice: 1, maxPrice: 1, status: 1, views: 1 })
				.limit(20)
				.toArray()
				.catch(() => []);

			// earnings (best-effort using transactions collection)
			let earningsMonth = 0;
			let earningsLifetime = 0;
			try {
				const startMonth = new Date();
				startMonth.setMonth(startMonth.getMonth() - 1);
				const aggrMonth = await Transactions.aggregate([
					{
						$match: {
							$or: [{ agentUid: uid }, { agentId }],
							createdAt: { $gte: startMonth },
						},
					},
					{ $group: { _id: null, total: { $sum: '$amount' } } },
				]).toArray();
				earningsMonth = aggrMonth[0]?.total || 0;

				const aggrLife = await Transactions.aggregate([
					{ $match: { $or: [{ agentUid: uid }, { agentId }] } },
					{ $group: { _id: null, total: { $sum: '$amount' } } },
				]).toArray();
				earningsLifetime = aggrLife[0]?.total || 0;
			} catch (e) {
				/* ignore if transactions missing */
			}

			const leads = await Offers.find({ $or: [{ agentUid: uid }, { agentId }] })
				.sort({ createdAt: -1 })
				.limit(20)
				.toArray()
				.catch(() => []);

			return res.json({
				agent: {
					id: agentId,
					name: userDoc?.name || userDoc?.displayName || 'Agent',
				},
				stats: {
					earningsMonth,
					earningsLifetime,
					listingsCount: listings.length,
				},
				listings,
				leads,
			});
		} catch (err) {
			console.error('dashboard.agent error', err);
			return res.status(500).send({ error: 'Internal server error' });
		}
	},
);

/**
 * ADMIN dashboard - only admin
 * GET /api/v1/dashboard/admin
 */
router.get(
	'/admin',
	verifyFireBaseToken,
	verifyRole(['admin', 'super-admin']),
	async (req, res) => {
		try {
			const Users = getCollection('users');
			const Properties = getCollection('properties');
			const Transactions = getCollection('transactions');
			const Reports = getCollection('reports');

			const totals = {
				users: await Users.countDocuments().catch(() => 0),
				agents: await Users.countDocuments({ role: 'agent' }).catch(() => 0),
				properties: await Properties.countDocuments().catch(() => 0),
				revenue: 0,
			};

			try {
				const rev = await Transactions.aggregate([
					{ $group: { _id: null, total: { $sum: '$amount' } } },
				]).toArray();
				totals.revenue = rev[0]?.total || 0;
			} catch (e) {
				totals.revenue = 0;
			}

			const pendingApprovals = await Users.find({
				role: 'agent',
				verified: false,
			})
				.limit(20)
				.toArray()
				.catch(() => []);
			const reports = await Reports.find({})
				.sort({ createdAt: -1 })
				.limit(10)
				.toArray()
				.catch(() => []);

			return res.json({ totals, pendingApprovals, reports });
		} catch (err) {
			console.error('dashboard.admin error', err);
			return res.status(500).send({ error: 'Internal server error' });
		}
	},
);

module.exports = router;
