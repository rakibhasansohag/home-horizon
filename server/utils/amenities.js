const AMENITY_GROUPS = [
	{
		id: 'comfort',
		label: 'Comfort',
		items: [
			{ id: 'wifi', label: 'Wi-Fi' },
			{ id: 'air-conditioning', label: 'Air conditioning' },
			{ id: 'ceiling-fans', label: 'Ceiling fans' },
			{ id: 'heating', label: 'Heating' },
			{ id: 'furnished', label: 'Furnished' },
			{ id: 'balcony', label: 'Balcony' },
		],
	},
	{
		id: 'kitchen',
		label: 'Kitchen and dining',
		items: [
			{ id: 'fitted-kitchen', label: 'Fitted kitchen' },
			{ id: 'gas-line', label: 'Gas line' },
			{ id: 'dining-space', label: 'Dining space' },
		],
	},
	{
		id: 'laundry',
		label: 'Laundry',
		items: [
			{ id: 'laundry', label: 'Laundry area' },
			{ id: 'wardrobe', label: 'Wardrobe' },
		],
	},
	{
		id: 'building',
		label: 'Building',
		items: [
			{ id: 'elevator', label: 'Elevator' },
			{ id: 'generator', label: 'Generator backup' },
			{ id: 'water-reserve', label: 'Water reserve' },
			{ id: 'intercom', label: 'Intercom' },
		],
	},
	{
		id: 'outdoor',
		label: 'Outdoor',
		items: [
			{ id: 'parking', label: 'Parking' },
			{ id: 'garden', label: 'Garden' },
			{ id: 'rooftop', label: 'Rooftop' },
			{ id: 'playground', label: 'Playground' },
		],
	},
	{
		id: 'wellness',
		label: 'Wellness',
		items: [
			{ id: 'pool', label: 'Swimming pool' },
			{ id: 'gym', label: 'Gym' },
			{ id: 'prayer-room', label: 'Prayer room' },
		],
	},
	{
		id: 'safety',
		label: 'Safety',
		items: [
			{ id: 'gated', label: 'Gated entry' },
			{ id: 'cctv', label: 'CCTV' },
			{ id: 'security', label: 'Security guard' },
			{ id: 'fire-safety', label: 'Fire safety' },
		],
	},
	{
		id: 'services',
		label: 'Services',
		items: [
			{ id: 'maintenance', label: 'Maintenance' },
			{ id: 'housekeeping', label: 'Housekeeping' },
			{ id: 'concierge', label: 'Concierge' },
		],
	},
];

const ALLOWED = new Set(
	AMENITY_GROUPS.flatMap((group) => group.items.map((item) => item.id)),
);

function sanitizeAmenities(value) {
	if (!Array.isArray(value)) return [];
	const seen = new Set();
	const amenities = [];
	for (const id of value) {
		if (typeof id !== 'string' || !ALLOWED.has(id) || seen.has(id)) continue;
		seen.add(id);
		amenities.push(id);
		if (amenities.length >= 30) break;
	}
	return amenities;
}

module.exports = { AMENITY_GROUPS, sanitizeAmenities };
