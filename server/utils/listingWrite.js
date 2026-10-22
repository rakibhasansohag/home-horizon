const { sanitizeAmenities } = require('./amenities');

const EDITABLE = [
	'title',
	'location',
	'minPrice',
	'maxPrice',
	'bedrooms',
	'bathrooms',
	'squareMeters',
	'googleMap',
	'description',
	'propertyType',
	'parking',
	'images',
	'agentName',
	'agentEmail',
	'agentImage',
];

function categoryNames(value) {
	if (!Array.isArray(value)) return [];
	return value
		.map((item) => (typeof item === 'string' ? item : item?.value))
		.map((item) => (typeof item === 'string' ? item.trim() : ''))
		.filter(Boolean);
}

function listingPatch(body) {
	const patch = {};
	for (const key of EDITABLE) {
		if (body[key] !== undefined) patch[key] = body[key];
	}
	if (Object.prototype.hasOwnProperty.call(body, 'categories')) {
		patch.categories = categoryNames(body.categories);
	}
	if (Object.prototype.hasOwnProperty.call(body, 'amenities')) {
		patch.amenities = sanitizeAmenities(body.amenities);
	}
	if (body.lat != null && body.lng != null && body.lat !== '' && body.lng !== '') {
		patch.coordinates = {
			lat: parseFloat(body.lat),
			lng: parseFloat(body.lng),
		};
	} else if (body.coordinates?.lat != null && body.coordinates?.lng != null) {
		patch.coordinates = {
			lat: parseFloat(body.coordinates.lat),
			lng: parseFloat(body.coordinates.lng),
		};
	}
	patch.updatedAt = new Date().toISOString();
	return patch;
}

module.exports = { listingPatch, categoryNames };
