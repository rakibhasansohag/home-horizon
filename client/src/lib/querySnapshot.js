const STORAGE_KEY = 'hh-query-snapshot';
const MAX_AGE = 30 * 60 * 1000;
const MAX_ENTRIES = 8;

function readAll() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		const parsed = raw ? JSON.parse(raw) : [];
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function idFor(queryKey) {
	return JSON.stringify(queryKey);
}

export function readSnapshot(queryKey) {
	const hit = readAll().find((item) => item?.id === idFor(queryKey));
	if (!hit || !Array.isArray(hit.data)) return undefined;
	if (Date.now() - Number(hit.updatedAt) > MAX_AGE) return undefined;
	return { data: hit.data, updatedAt: hit.updatedAt };
}

export function writeSnapshot(queryKey, data) {
	if (!Array.isArray(data)) return;
	const next = [
		{
			id: idFor(queryKey),
			data,
			updatedAt: Date.now(),
		},
		...readAll().filter((item) => item?.id !== idFor(queryKey)),
	].slice(0, MAX_ENTRIES);
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
	} catch {
		localStorage.removeItem(STORAGE_KEY);
	}
}

export function listingSnapshot(list) {
	if (!Array.isArray(list)) return [];
	return list.slice(0, 80).map((home) => ({
		_id: home?._id,
		title: home?.title,
		location: home?.location,
		minPrice: home?.minPrice,
		maxPrice: home?.maxPrice,
		bedrooms: home?.bedrooms,
		bathrooms: home?.bathrooms,
		squareMeters: home?.squareMeters,
		propertyType: home?.propertyType,
		amenities: home?.amenities,
		images: home?.images?.[0]?.url ? [{ url: home.images[0].url }] : [],
		coordinates: home?.coordinates,
		agentName: home?.agentName,
		agentImage: home?.agentImage,
	}));
}
