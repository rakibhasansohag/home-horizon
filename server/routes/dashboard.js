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
			const Transactions = getCollection('transactions');
			const Reviews = getCollection('reviews');
			const Users = getCollection('users');

			// agent's profile
			const userDoc = await findUserByUid(uid);
			const agentId = uid;

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
				// lifetime: sum amount OR offerAmount for offers with status 'bought'
				const lifeAgg = await Offers.aggregate([
					{ $match: { agentId: agentId, status: 'bought' } },
					{
						$group: {
							_id: null,
							total: {
								$sum: {
									$toDouble: {
										$ifNull: ['$amount', '$offerAmount', 0],
									},
								},
							},
						},
					},
				]).toArray();
				earningsLifetime = Number(lifeAgg[0]?.total || 0);

				// earnings for "this month" (last 30 days) --
				const startMonth = new Date();
				startMonth.setMonth(startMonth.getMonth() - 1); // 1 month back
				const startIso = startMonth.toISOString();

				const monthAgg = await Offers.aggregate([
					{
						$match: {
							agentId: agentId,
							status: 'bought',
							// use $expr to convert stored paidAt to Date and compare
							$expr: {
								$gte: [
									{
										$toDate: {
											$ifNull: ['$paidAt', new Date(0).toISOString()],
										},
									},
									new Date(startIso),
								],
							},
						},
					},
					{
						$group: {
							_id: null,
							total: {
								$sum: {
									$toDouble: {
										$ifNull: ['$amount', '$offerAmount', 0],
									},
								},
							},
						},
					},
				]).toArray();

				earningsMonth = Number(monthAgg[0]?.total || 0);
			} catch (e) {
				console.warn('earnings aggregation failed', e);
				earningsLifetime = earningsLifetime || 0;
				earningsMonth = earningsMonth || 0;
			}

			// 5) Reviews (unchanged)
			let reviews = [];
			let ratingAvg = null;
			let totalReviews = 0;
			let reviewsPreview = [];

			try {
				// property ids of agent's listings as strings
				const propIds = listings
					.map((l) => (l._id ? String(l._id) : l._id))
					.filter(Boolean);

				if (propIds.length) {
					// get all reviews for those properties sorted by newest
					reviews = await Reviews.find({ propertyId: { $in: propIds } })
						.sort({ createdAt: -1 })
						.toArray();

					totalReviews = reviews.length;

					// rating average
					const ratings = reviews
						.map((r) => Number(r.rating))
						.filter((v) => !isNaN(v));
					ratingAvg = ratings.length
						? ratings.reduce((a, b) => a + b, 0) / ratings.length
						: null;

					// prepare preview (latest 5)
					const latest = reviews.slice(0, 5);

					// fetch property docs for those review propertyIds (to attach title/image)
					const reviewPropertyIds = [
						...new Set(latest.map((r) => r.propertyId)),
					].filter(Boolean);

					const reviewPropDocs = reviewPropertyIds.length
						? await Properties.find({
								_id: { $in: reviewPropertyIds.map((id) => new ObjectId(id)) },
						  })
								.project({ title: 1, images: 1 })
								.toArray()
						: [];

					// attach property summary into each review preview
					reviewsPreview = latest.map((r) => {
						const prop =
							reviewPropDocs.find(
								(p) => String(p._id) === String(r.propertyId),
							) || null;
						return {
							_id: r._id,
							propertyId: r.propertyId,
							property: prop
								? {
										title: prop.title,
										image: prop.images?.[0]?.url || null,
								  }
								: null,
							rating: Number(r.rating) || null,
							reviewText: r.reviewText || r.review || '',
							userName: r.userName || r.name || r.user?.name || 'User',
							userImage: r.userImage || r.profilePic || r.user?.avatar || '',
							createdAt: r.createdAt || r.created_at || null,
						};
					});
				} else {
					reviews = [];
					totalReviews = 0;
					ratingAvg = null;
					reviewsPreview = [];
				}
			} catch (e) {
				console.warn('reviews fetch failed', e);
				reviews = [];
				totalReviews = 0;
				ratingAvg = null;
				reviewsPreview = [];
			}

			// ---------- sparkline (last 6 months robust) ----------
			const months = [];
			const now = new Date();
			for (let i = 5; i >= 0; i--) {
				const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
				const start = new Date(d.getFullYear(), d.getMonth(), 1); // 1st of month
				const end = new Date(d.getFullYear(), d.getMonth() + 1, 1); // 1st of next month
				const label = d.toLocaleString('default', { month: 'short' });
				months.push({ month: label, start, end });
			}

			const viewsByMonth = await Promise.all(
				months.map(async (m) => {
					try {
						const ag = await Offers.aggregate([
							{
								$match: {
									agentId: agentId,
									status: 'bought',
									$expr: {
										$and: [
											{
												$gte: [
													{
														$toDate: {
															$ifNull: ['$paidAt', new Date(0).toISOString()],
														},
													},
													m.start,
												],
											},
											{
												$lt: [
													{
														$toDate: {
															$ifNull: ['$paidAt', new Date(0).toISOString()],
														},
													},
													m.end,
												],
											},
										],
									},
								},
							},
							{
								$group: {
									_id: null,
									total: {
										$sum: {
											$toDouble: {
												$ifNull: ['$amount', '$offerAmount', 0],
											},
										},
									},
								},
							},
						]).toArray();

						return { month: m.month, value: Number(ag[0]?.total || 0) };
					} catch (err) {
						return { month: m.month, value: 0 };
					}
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
				reviewsPreview,
				reviewsCount: totalReviews,
				ratingAvg,
				earningsSparkline: viewsByMonth,
			});
		} catch (err) {
			console.error('dashboard.agent error', err);
			return res.status(500).send({ error: 'Internal server error' });
		}
	},
);



/**
 * Admin dashboard summary endpoint
 * GET /api/v1/dashboard/admin
 *
 * Protected: verifyFireBaseToken + verifyRole(['admin','super-admin'])
 *
 * Returns:
 * {
 *   totals: { users, agents, properties, verifiedProperties, advertised, revenue },
 *   recentUsers: [...],
 *   recentProperties: [...],
 *   recentTransactions: [...],
 *   pendingAgentApprovals: [...],
 *   topAgents: [...],
 *   revenueSparkline: [{month, value}, ...6],
 *   counts: {...}
 * }
 */

router.get(
  '/admin',
  verifyFireBaseToken,
  verifyRole(['admin', 'super-admin']),
  async (req, res) => {
    try {
      const Users = getCollection('users');
      const Properties = getCollection('properties');
      const Offers = getCollection('offers');
      const Transactions = getCollection('transactions'); 
      const Reviews = getCollection('reviews');

      // totals (best-effort - catches missing collections)
      const totals = {
        users: await Users.countDocuments().catch(() => 0),
        agents: await Users.countDocuments({ role: 'agent' }).catch(() => 0),
        properties: await Properties.countDocuments().catch(() => 0),
        verifiedProperties: await Properties.countDocuments({ verificationStatus: 'verified' }).catch(() => 0),
        advertised: await Properties.countDocuments({ isAdvertised: true }).catch(() => 0),
        reviews: await Reviews.countDocuments().catch(() => 0),
        revenue: 0,
      };

      // revenue (try Offers first, fallback to Transactions)
      try {
        const rev = await Offers.aggregate([
          { $match: { status: 'bought', amount: { $exists: true } } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]).toArray();
        totals.revenue = rev[0]?.total || 0;
      } catch (e) {
        try {
          const revTx = await Transactions.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ]).toArray();
          totals.revenue = revTx[0]?.total || 0;
        } catch (e2) {
          totals.revenue = 0;
        }
      }

      // recent users (last 6)
      const recentUsers = await Users.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .project({ name: 1, email: 1, role: 1, profilePic: 1, createdAt: 1 })
        .toArray()
        .catch(() => []);

      // recent properties (last 6)
      const recentProperties = await Properties.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .project({ title: 1, images: 1, minPrice: 1, maxPrice: 1, location: 1, verificationStatus: 1, isAdvertised: 1, createdAt: 1, agentName: 1 })
        .toArray()
        .catch(() => []);

      // recent transactions (from Offers with isPaid / bought OR Transactions)
    let recentTransactions = [];
		try {
			// Try to use Offers collection (preferred in your app)
			recentTransactions = await Offers.find({ status: 'bought' })
				.sort({ paidAt: -1 })
				.limit(8)
				.project({
					propertyId: 1,
					propertyTitle: 1,
					buyerName: 1,
					buyerId: 1,
					amount: 1,
					offerAmount: 1,
					transactionId: 1,
					paidAt: 1,
					createdAt: 1,
				})
				.toArray();

			// normalize: ensure amount is a Number using offerAmount fallback
			recentTransactions = recentTransactions.map((t) => {
				const amount =
					t.amount != null
						? Number(t.amount)
						: t.offerAmount != null
						? Number(t.offerAmount)
						: 0;
				return { ...t, amount: Number.isFinite(amount) ? amount : 0 };
			});
		} catch (e) {
			// fallback to transactions collection (if Offers not present or query failed)
			try {
				recentTransactions = await Transactions.find({})
					.sort({ createdAt: -1 })
					.limit(8)
					.project({
						amount: 1,
						agentId: 1,
						propertyId: 1,
						createdAt: 1,
						transactionId: 1,
					})
					.toArray();
				recentTransactions = recentTransactions.map((t) => ({
					...t,
					amount: Number(t.amount || 0),
				}));
			} catch (e2) {
				recentTransactions = [];
			}
		}

      // pending agent approvals (agent role + verified flag false)
      const pendingAgentApprovals = await Users.find({ role: 'agent', verified: { $ne: true } })
        .sort({ createdAt: -1 })
        .limit(10)
        .project({ name: 1, email: 1, uid: 1, createdAt: 1 })
        .toArray()
        .catch(() => []);

      // top agents by revenue (aggregate offers)
      let topAgents = [];
      try {
        const agg = await Offers.aggregate([
          { $match: { status: 'bought', amount: { $exists: true } } },
          { $group: { _id: '$agentId', total: { $sum: '$amount' }, count: { $sum: 1 } } },
          { $sort: { total: -1 } },
          { $limit: 6 },
        ]).toArray();
        // attach agent info
        const agentIds = agg.map((a) => a._id).filter(Boolean);
        const agentDocs = agentIds.length ? await Users.find({ uid: { $in: agentIds } }).project({ uid: 1, name: 1, profilePic: 1 }).toArray() : [];
        topAgents = agg.map((a) => {
          const doc = agentDocs.find((d) => d.uid === a._id);
          return { id: a._id, total: a.total, count: a.count, name: doc?.name || a._id, avatar: doc?.profilePic || '' };
        });
      } catch (e) {
        topAgents = [];
      }

      // revenue sparkline: last 6 months (safe JS loop + aggregate per month)
      const months = [];
			const now = new Date();
			for (let i = 5; i >= 0; i--) {
				const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
				const start = new Date(d.getFullYear(), d.getMonth(), 1); // first day of month
				const end = new Date(d.getFullYear(), d.getMonth() + 1, 1); // first day of next month
				const label = d.toLocaleString('default', { month: 'short' });
				months.push({ label, start, end });
			}

			const revenueSparkline = await Promise.all(
				months.map(async (m) => {
					try {
						// Aggregation is defensive: $ifNull, $toDate, $toDouble
						const ag = await Offers.aggregate([
							{
								$match: {
									status: 'bought',
									$expr: {
										$and: [
											{
												$gte: [
													{
														$toDate: {
															$ifNull: ['$paidAt', new Date(0).toISOString()],
														},
													},
													m.start,
												],
											},
											{
												$lt: [
													{
														$toDate: {
															$ifNull: ['$paidAt', new Date(0).toISOString()],
														},
													},
													m.end,
												],
											},
										],
									},
								},
							},
							{
								$group: {
									_id: null,
									total: {
										$sum: {
											$toDouble: {
												$ifNull: ['$amount', '$offerAmount', 0],
											},
										},
									},
								},
							},
						]).toArray();

						return { month: m.label, value: Number(ag[0]?.total || 0) };
					} catch (err) {
						// In case the server's Mongo version lacks $toDate/$toDouble, return 0 for safety
						console.warn(
							'sparkline aggregation error for month',
							m.label,
							err.message,
						);
						return { month: m.label, value: 0 };
					}
				}),
			);

      // final counts we might want separately
      const counts = {
        pendingProperties: await Properties.countDocuments({ verificationStatus: 'pending' }).catch(() => 0),
        advertised: totals.advertised,
        users: totals.users,
      };

      return res.json({
        totals,
        counts,
        recentUsers,
        recentProperties,
        recentTransactions,
        pendingAgentApprovals,
        topAgents,
        revenueSparkline,
      });
    } catch (err) {
      console.error('adminDashboard.error', err);
      return res.status(500).send({ error: 'Internal server error' });
    }
  },
);


module.exports = router;
