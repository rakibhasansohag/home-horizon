import {
	AirVent,
	ArrowUpDown,
	Bell,
	Building2,
	Car,
	CookingPot,
	Droplets,
	Dumbbell,
	Fan,
	FireExtinguisher,
	Flame,
	Heater,
	Lock,
	Moon,
	Phone,
	Shield,
	Shirt,
	Sofa,
	Sparkles,
	Sun,
	Tent,
	Trees,
	Utensils,
	Video,
	WashingMachine,
	Waves,
	Wifi,
	Wrench,
	Zap,
} from 'lucide-react';

export const AMENITY_GROUPS = [
	{
		id: 'comfort',
		label: 'Comfort',
		items: [
			{ id: 'wifi', label: 'Wi-Fi', icon: Wifi },
			{ id: 'air-conditioning', label: 'Air conditioning', icon: AirVent },
			{ id: 'ceiling-fans', label: 'Ceiling fans', icon: Fan },
			{ id: 'heating', label: 'Heating', icon: Heater },
			{ id: 'furnished', label: 'Furnished', icon: Sofa },
			{ id: 'balcony', label: 'Balcony', icon: Sun },
		],
	},
	{
		id: 'kitchen',
		label: 'Kitchen and dining',
		items: [
			{ id: 'fitted-kitchen', label: 'Fitted kitchen', icon: CookingPot },
			{ id: 'gas-line', label: 'Gas line', icon: Flame },
			{ id: 'dining-space', label: 'Dining space', icon: Utensils },
		],
	},
	{
		id: 'laundry',
		label: 'Laundry',
		items: [
			{ id: 'laundry', label: 'Laundry area', icon: WashingMachine },
			{ id: 'wardrobe', label: 'Wardrobe', icon: Shirt },
		],
	},
	{
		id: 'building',
		label: 'Building',
		items: [
			{ id: 'elevator', label: 'Elevator', icon: ArrowUpDown },
			{ id: 'generator', label: 'Generator backup', icon: Zap },
			{ id: 'water-reserve', label: 'Water reserve', icon: Droplets },
			{ id: 'intercom', label: 'Intercom', icon: Phone },
		],
	},
	{
		id: 'outdoor',
		label: 'Outdoor',
		items: [
			{ id: 'parking', label: 'Parking', icon: Car },
			{ id: 'garden', label: 'Garden', icon: Trees },
			{ id: 'rooftop', label: 'Rooftop', icon: Building2 },
			{ id: 'playground', label: 'Playground', icon: Tent },
		],
	},
	{
		id: 'wellness',
		label: 'Wellness',
		items: [
			{ id: 'pool', label: 'Swimming pool', icon: Waves },
			{ id: 'gym', label: 'Gym', icon: Dumbbell },
			{ id: 'prayer-room', label: 'Prayer room', icon: Moon },
		],
	},
	{
		id: 'safety',
		label: 'Safety',
		items: [
			{ id: 'gated', label: 'Gated entry', icon: Lock },
			{ id: 'cctv', label: 'CCTV', icon: Video },
			{ id: 'security', label: 'Security guard', icon: Shield },
			{ id: 'fire-safety', label: 'Fire safety', icon: FireExtinguisher },
		],
	},
	{
		id: 'services',
		label: 'Services',
		items: [
			{ id: 'maintenance', label: 'Maintenance', icon: Wrench },
			{ id: 'housekeeping', label: 'Housekeeping', icon: Sparkles },
			{ id: 'concierge', label: 'Concierge', icon: Bell },
		],
	},
];

const BY_ID = new Map(
	AMENITY_GROUPS.flatMap((group) => group.items.map((item) => [item.id, item])),
);

export function amenityById(id) {
	return BY_ID.get(id) || null;
}

export function listedAmenities(ids) {
	if (!Array.isArray(ids)) return [];
	const seen = new Set();
	const items = [];
	for (const id of ids) {
		const item = BY_ID.get(id);
		if (!item || seen.has(id)) continue;
		seen.add(id);
		items.push(item);
	}
	return items;
}

export function amenitiesByGroup(ids) {
	const selected = new Set(listedAmenities(ids).map((item) => item.id));
	return AMENITY_GROUPS.map((group) => ({
		...group,
		items: group.items.filter((item) => selected.has(item.id)),
	})).filter((group) => group.items.length > 0);
}

export function homeFacts(property) {
	if (!property) return '';
	const parts = [];
	if (property.bedrooms != null && property.bedrooms !== '') {
		parts.push(`${property.bedrooms} bed`);
	}
	if (property.bathrooms != null && property.bathrooms !== '') {
		parts.push(`${property.bathrooms} bath`);
	}
	return parts.join(' · ');
}
