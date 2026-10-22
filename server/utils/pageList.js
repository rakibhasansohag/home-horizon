const { getCollection } = require('../config/db');

const PAGE_LIMIT = 6;

function escapeRegex(value) {
	return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function wantsPage(query) {
	return query.page != null && String(query.page) !== '';
}

function readPage(query) {
	const page = Math.max(1, parseInt(query.page, 10) || 1);
	const limit = Math.min(
		24,
		Math.max(1, parseInt(query.limit, 10) || PAGE_LIMIT),
	);
	return { page, limit, skip: (page - 1) * limit };
}

function searchPattern(q) {
	const term = String(q || '').trim();
	if (!term) return null;
	return new RegExp(escapeRegex(term), 'i');
}

function monthBounds() {
	const start = new Date();
	start.setDate(1);
	start.setHours(0, 0, 0, 0);
	const end = new Date(start);
	end.setMonth(end.getMonth() + 1);
	return { $gte: start.toISOString(), $lt: end.toISOString() };
}

async function matchingHomeIds(pattern) {
	const Properties = getCollection('properties');
	const homes = await Properties.find({
		$or: [{ title: pattern }, { location: pattern }],
	})
		.project({ _id: 1 })
		.toArray();
	return homes.map((home) => String(home._id));
}

async function paged(collection, filter, { page, limit, skip, sort }) {
	const [total, items] = await Promise.all([
		collection.countDocuments(filter),
		collection
			.find(filter)
			.sort(sort || { _id: -1 })
			.skip(skip)
			.limit(limit)
			.toArray(),
	]);
	return {
		items,
		total,
		page,
		limit,
		pages: Math.max(1, Math.ceil(total / limit) || 1),
	};
}

async function sumField(collection, filter, field) {
	const rows = await collection.find(filter).project({ [field]: 1 }).toArray();
	return rows.reduce((sum, row) => sum + (Number(row[field]) || 0), 0);
}

module.exports = {
	PAGE_LIMIT,
	wantsPage,
	readPage,
	searchPattern,
	monthBounds,
	matchingHomeIds,
	paged,
	sumField,
};
