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
 */
router.get(
	'/agent',
	verifyFireBaseToken,
	verifyRole(['agent']),
	async (req, res) => {
		try {
			const uid = req.decoded?.uid;
			if (!uid) return res.status(401).send({ error: 'Unauthorized' });

			const Properties = getCollection('properties');
			const Offers = getCollection('offers');
			const Transactions = getCollection('transactions'); // optional
			const Reviews = getCollection('reviews');
			const Users = getCollection('users');

			// agent's profile
			const userDoc = await findUserByUid(uid);
			const agentId = uid; // agent uid used as agentId in your data

			// 1) Listings by this agent
			const listings = await Properties.find({ agentId: agentId })
				.project({
					title: 1,
					images: 1,
					minPrice: 1,
					maxPrice: 1,
					location: 1,
					status: 1,
					isAdvertised: 1,
					createdAt: 1,
					views: 1,
				})
				.sort({ createdAt: -1 })
				.toArray();

			const activeListingsCount = listings.filter(
				(l) => l.status !== 'sold',
			).length;
			const advertisedCount = listings.filter((l) => l.isAdvertised).length;

			// 2) Leads (pending offers for this agent)
			const leads = await Offers.find({ agentId: agentId, status: 'pending' })
				.sort({ createdAt: -1 })
				.limit(20)
				.toArray();

			// populate property details for leads
			const leadPropertyIds = [
				...new Set(leads.map((l) => l.propertyId)),
			].filter(Boolean);
			const leadPropDocs = leadPropertyIds.length
				? await Properties.find({
						_id: { $in: leadPropertyIds.map((id) => new ObjectId(id)) },
				  })
						.project({
							title: 1,
							images: 1,
							location: 1,
							minPrice: 1,
							maxPrice: 1,
						})
						.toArray()
				: [];

			// enrich leads with property doc (if exists)
			const leadsEnriched = leads.map((l) => {
				const prop =
					leadPropDocs.find((p) => p._id.toString() === String(l.propertyId)) ||
					null;
				// normalize numeric fields
				const normalized = {
					...l,
					amount: l.amount
						? Number(l.amount)
						: l.offerAmount
						? Number(l.offerAmount)
						: null,
					offerAmount: l.offerAmount
						? Number(l.offerAmount)
						: l.amount
						? Number(l.amount)
						: null,
					property: prop,
				};
				return normalized;
			});

			// 3) Sold / completed (offers with status 'bought')
			const soldOffers = await Offers.find({
				agentId: agentId,
				status: 'bought',
			})
				.sort({ paidAt: -1 })
				.limit(20)
				.toArray();

			const soldPropertyIds = [
				...new Set(soldOffers.map((o) => o.propertyId)),
			].filter(Boolean);
			const soldProps = soldPropertyIds.length
				? await Properties.find({
						_id: { $in: soldPropertyIds.map((id) => new ObjectId(id)) },
				  })
						.project({ title: 1, images: 1, location: 1 })
						.toArray()
				: [];

			const soldEnriched = soldOffers.map((o) => ({
				...o,
				amount: o.amount
					? Number(o.amount)
					: o.offerAmount
					? Number(o.offerAmount)
					: 0,
				property:
					soldProps.find((p) => p._id.toString() === String(o.propertyId)) ||
					null,
			}));

			// ----- Attach buyer info for leads & sold (so frontend can show buyer name/avatar) -----
			try {
				// collect distinct buyerIds from leads and sold
				const buyerIds = [
					...new Set([
						...leadsEnriched.map((l) => l.buyerId).filter(Boolean),
						...soldEnriched.map((s) => s.buyerId).filter(Boolean),
					]),
				];

				let buyerDocs = [];
				if (buyerIds.length) {
					buyerDocs = await Users.find({ uid: { $in: buyerIds } })
						.project({ uid: 1, name: 1, profilePic: 1, photoURL: 1 })
						.toArray()
						.catch(() => []);
				}

				// attach buyer onto each offer
				leadsEnriched.forEach((l) => {
					const b = buyerDocs.find((bd) => bd.uid === l.buyerId);
					l.buyer = b
						? {
								name: b.name || b.displayName || l.buyerName,
								avatar: b.profilePic || b.photoURL || '',
						  }
						: { name: l.buyerName || 'Buyer', avatar: l.buyerImage || '' };
				});

				soldEnriched.forEach((s) => {
					const b = buyerDocs.find((bd) => bd.uid === s.buyerId);
					s.buyer = b
						? {
								name: b.name || s.buyerName,
								avatar: b.profilePic || b.photoURL || '',
						  }
						: { name: s.buyerName || 'Buyer', avatar: s.buyerImage || '' };
				});
			} catch (e) {
				// if users collection doesn't exist or query fails, keep going:
				console.warn('attach buyer info failed', e);
			}

			// 4) Earnings (unchanged): compute earningsLifetime, earningsMonth
			let earningsLifetime = 0;
			let earningsMonth = 0;
			try {
				const boughtWithAmount = await Offers.aggregate([
					{
						$match: {
							agentId: agentId,
							status: 'bought',
							amount: { $exists: true },
						},
					},
					{ $group: { _id: null, total: { $sum: '$amount' } } },
				]).toArray();
				earningsLifetime = boughtWithAmount[0]?.total || 0;

				const startMonth = new Date();
				startMonth.setMonth(startMonth.getMonth() - 1);
				const boughtThisMonth = await Offers.aggregate([
					{
						$match: {
							agentId: agentId,
							status: 'bought',
							paidAt: { $gte: startMonth },
						},
					},
					{ $group: { _id: null, total: { $sum: '$amount' } } },
				]).toArray();
				earningsMonth = boughtThisMonth[0]?.total || 0;
			} catch (e) {
				try {
					const txLife = await Transactions.aggregate([
						{ $match: { agentId: agentId } },
						{ $group: { _id: null, total: { $sum: '$amount' } } },
					]).toArray();
					earningsLifetime = txLife[0]?.total || 0;

					const startMonth = new Date();
					startMonth.setMonth(startMonth.getMonth() - 1);
					const txMonth = await Transactions.aggregate([
						{ $match: { agentId: agentId, createdAt: { $gte: startMonth } } },
						{ $group: { _id: null, total: { $sum: '$amount' } } },
					]).toArray();
					earningsMonth = txMonth[0]?.total || 0;
				} catch (err) {
					earningsLifetime = earningsLifetime || 0;
					earningsMonth = earningsMonth || 0;
				}
			}

			// 5) Reviews (unchanged)
			let reviews = [];
			let ratingAvg = null;
			try {
				const propIds = listings.map((l) => l._id);
				if (propIds.length) {
					reviews = await Reviews.find({
						propertyId: { $in: propIds.map((id) => id.toString()) },
					}).toArray();
					const ratings = reviews
						.map((r) => Number(r.rating))
						.filter((v) => !isNaN(v));
					ratingAvg = ratings.length
						? ratings.reduce((a, b) => a + b, 0) / ratings.length
						: null;
				}
			} catch (e) {
				reviews = [];
			}

			// earnings sparkline (unchanged)
			const months = [];
			const now = new Date();
			for (let i = 5; i >= 0; i--) {
				const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
				const label = d.toLocaleString('default', { month: 'short' });
				months.push({
					month: label,
					start: new Date(d),
					end: new Date(d.getFullYear(), d.getMonth() + 1, 1),
				});
			}
			const viewsByMonth = await Promise.all(
				months.map(async (m) => {
					const sumRes = await Offers.aggregate([
						{
							$match: {
								agentId: agentId,
								status: 'bought',
								paidAt: { $gte: m.start, $lt: m.end },
							},
						},
						{ $group: { _id: null, total: { $sum: '$amount' } } },
					])
						.toArray()
						.catch(() => []);
					return { month: m.month, value: sumRes[0]?.total || 0 };
				}),
			);

			// previews limited to 5 (frontend-friendly)
			const take5 = (arr) => (Array.isArray(arr) ? arr.slice(0, 5) : []);

			return res.json({
				agent: {
					id: userDoc?._id || uid,
					name: userDoc?.name || req.decoded?.name || 'Agent',
					avatar: userDoc?.profilePic || userDoc?.photoURL || '',
					role: 'agent',
				},
				stats: {
					earningsMonth,
					earningsLifetime,
					activeListingsCount,
					advertisedCount,
					leadsCount: leads.length,
					soldCount: soldOffers.length,
					ratingAvg,
				},
				listings,
				listingsPreview: take5(listings),
				leads: leadsEnriched,
				leadsPreview: take5(leadsEnriched),
				sold: soldEnriched,
				soldPreview: take5(soldEnriched),
				reviews,
				earningsSparkline: viewsByMonth,
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
