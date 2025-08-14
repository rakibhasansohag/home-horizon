const express = require('express');
const router = express.Router();
const { getCollection } = require('../config/db');
const { verifyFireBaseToken, verifyRole } = require('../middlewares/auth');
const { ObjectId } = require('mongodb');

// GET /api/v1/properties/verified
router.get('/verified', async (req, res) => {
	try {
		const {
			search = '',
			sort = 'desc',
			swLat,
			swLng,
			neLat,
			neLng,
		} = req.query;
		const filter = {
			verificationStatus: 'verified',
			...(search && { location: { $regex: search, $options: 'i' } }),
		};
		if (swLat && swLng && neLat && neLng) {
			filter['coordinates.lat'] = {
				$gte: parseFloat(swLat),
				$lte: parseFloat(neLat),
			};
			filter['coordinates.lng'] = {
				$gte: parseFloat(swLng),
				$lte: parseFloat(neLng),
			};
		}
		const sortOption = sort === 'asc' ? 1 : -1;
		const Properties = getCollection('properties');
		const properties = await Properties.find(filter)
			.sort({ minPrice: sortOption })
			.toArray();
		res.send(properties);
	} catch (err) {
		console.error('properties.verified error', err);
		res.status(500).send({ error: 'Internal server error' });
	}
});

// Point: -------- Private ------------

// POST /api/v1/properties  - create: agent or super-admin
router.post(
	'/',
	verifyFireBaseToken,
	verifyRole(['agent', 'super-admin']),
	async (req, res) => {
		try {
			const newProperty = req.body;
			newProperty.createdAt = new Date().toISOString();
			newProperty.updatedAt = new Date().toISOString();
			newProperty.verificationStatus = 'pending';
			newProperty.isAdvertised = false;
			newProperty.reviews = [];
			newProperty.dealStatus = null;
			const Properties = getCollection('properties');
			const result = await Properties.insertOne(newProperty);
			res.status(201).send(result);
		} catch (err) {
			console.error('properties.post error', err);
			res.status(500).send({ error: 'Property insert failed' });
		}
	},
);

// GET /api/v1/properties/:id  - protected
router.get('/:id', verifyFireBaseToken, async (req, res) => {
	try {
		const propertyId = req.params.id;
		const Properties = getCollection('properties');
		const property = await Properties.findOne({
			_id: new ObjectId(propertyId),
		});
		if (!property) return res.status(404).send({ error: 'Property not found' });
		res.send(property);
	} catch (err) {
		console.error('properties.get error', err);
		res.status(500).send({ error: 'Internal server error' });
	}
});

// PUT /api/v1/properties/:id - update by agent (agent must own)
router.put(
	'/:id',
	verifyFireBaseToken,
	verifyRole(['agent', 'super-admin']),
	async (req, res) => {
		try {
			const propertyId = req.params.id;
			if (!ObjectId.isValid(propertyId))
				return res.status(400).send({ error: 'Invalid property ID' });
			const updatedData = req.body;
			const Properties = getCollection('properties');
			delete updatedData._id;
			const result = await Properties.updateOne(
				{ _id: new ObjectId(propertyId), agentId: req.decoded.uid },
				{ $set: { ...updatedData, updatedAt: new Date().toISOString() } },
			);
			if (result.modifiedCount === 0)
				return res
					.status(404)
					.send({ error: 'Property not updated or not found' });
			res.send({ message: 'Property updated successfully' });
		} catch (err) {
			console.error('properties.put error', err);
			res.status(500).send({ error: 'Internal server error' });
		}
	},
);

// DELETE /api/v1/properties/:id - by agent
router.delete(
	'/:id',
	verifyFireBaseToken,
	verifyRole(['agent', 'super-admin']),
	async (req, res) => {
		try {
			const propertyId = req.params.id;
			if (!ObjectId.isValid(propertyId))
				return res.status(400).send({ error: 'Invalid property ID' });
			const Properties = getCollection('properties');
			const result = await Properties.deleteOne({
				_id: new ObjectId(propertyId),
				agentId: req.decoded.uid,
			});
			if (result.deletedCount === 0)
				return res
					.status(404)
					.send({ error: 'Property not found or unauthorized' });
			res.send({ message: 'Property deleted successfully' });
		} catch (err) {
			console.error('properties.delete error', err);
			res.status(500).send({ error: 'Internal server error' });
		}
	},
);

// GET my properties (agent)
router.get(
	'/my/list',
	verifyFireBaseToken,
	verifyRole(['agent', 'super-admin']),
	async (req, res) => {
		try {
			const Properties = getCollection('properties');
			const agentId = req.decoded.uid;
			const myProperties = await Properties.find({ agentId })
				.sort({ createdAt: -1 })
				.toArray();
			res.send(myProperties);
		} catch (err) {
			console.error('properties.my.list error', err);
			res.status(500).send({ error: 'Internal server error' });
		}
	},
);

module.exports = router;
