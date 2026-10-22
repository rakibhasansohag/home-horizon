const { ObjectId } = require('mongodb');
const { getCollection } = require('../config/db');

function toId(value) {
	const text = String(value || '');
	if (!/^[a-f0-9]{24}$/i.test(text)) return null;
	return new ObjectId(text);
}

function homeSummary(home) {
	if (!home) return null;
	return {
		_id: String(home._id),
		title: home.title || '',
		location: home.location || '',
		image: home.images?.[0]?.url || '',
		minPrice: home.minPrice,
		maxPrice: home.maxPrice,
		agentName: home.agentName || '',
		agentImage: home.agentImage || '',
	};
}

async function attachHomes(records) {
	if (!Array.isArray(records) || records.length === 0) return records || [];

	const Properties = getCollection('properties');
	const ids = [
		...new Set(records.map((record) => toId(record.propertyId)).filter(Boolean)),
	];
	const homes = ids.length
		? await Properties.find({ _id: { $in: ids } })
				.project({
					title: 1,
					location: 1,
					images: 1,
					minPrice: 1,
					maxPrice: 1,
					agentName: 1,
					agentImage: 1,
				})
				.toArray()
		: [];
	const byId = new Map(homes.map((home) => [String(home._id), home]));

	return records.map((record) => {
		const home = byId.get(String(record.propertyId));
		const summary = homeSummary(home);
		return {
			...record,
			propertyTitle: record.propertyTitle || summary?.title || '',
			propertyLocation: record.propertyLocation || summary?.location || '',
			propertyImage: record.propertyImage || summary?.image || '',
			agentName: record.agentName || summary?.agentName || '',
			property: summary,
		};
	});
}

module.exports = { attachHomes };
