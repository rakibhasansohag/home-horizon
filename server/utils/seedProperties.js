const bdLocations = [
	{ location: 'Gulshan, Dhaka', lat: 23.7806, lng: 90.4193 },
	{ location: 'Uttara, Dhaka', lat: 23.8738, lng: 90.3984 },
	{ location: 'Banani, Dhaka', lat: 23.7936, lng: 90.4068 },
	{ location: 'Dhanmondi, Dhaka', lat: 23.745, lng: 90.3748 },
	{ location: 'Mirpur, Dhaka', lat: 23.8066, lng: 90.369 },
	{ location: 'Rajshahi Sadar, Rajshahi', lat: 24.3745, lng: 88.6042 },
	{ location: 'Chawkbazar, Chattogram', lat: 22.3422, lng: 91.8347 },
	{ location: 'Khulna Sadar, Khulna', lat: 22.8456, lng: 89.5403 },
	{ location: 'Barisal Sadar, Barisal', lat: 22.701, lng: 90.3535 },
	{ location: 'Sylhet Sadar, Sylhet', lat: 24.8949, lng: 91.8687 },
	{ location: 'Comilla Sadar, Cumilla', lat: 23.4607, lng: 91.1809 },
	{ location: 'Tangail Sadar, Tangail', lat: 24.2498, lng: 89.9167 },
	{ location: 'Bogra Sadar, Bogura', lat: 24.85, lng: 89.37 },
	{ location: 'Jessore Sadar, Jashore', lat: 23.1667, lng: 89.2167 },
	{ location: 'Mymensingh Sadar, Mymensingh', lat: 24.7564, lng: 90.406 },
	{ location: 'Rangpur Sadar, Rangpur', lat: 25.7558, lng: 89.2442 },
	{ location: 'Naogaon Sadar, Naogaon', lat: 24.8012, lng: 88.9475 },
	{ location: 'Savar, Dhaka', lat: 23.8288, lng: 90.2549 },
	{ location: 'Narayanganj Sadar, Narayanganj', lat: 23.6238, lng: 90.5 },
];

const generateRandomImages = () => {
	const randomId = () => Math.floor(Math.random() * 1000);
	return Array.from({ length: 5 }).map(() => {
		const id = randomId();
		return {
			url: `https://picsum.photos/seed/${id}/600/400`,
			public_id: `random/${id}`,
		};
	});
};

module.exports = function seedProperties() {
	const seed = Array.from({ length: 20 }).map((_, index) => {
		const locationData =
			bdLocations[Math.floor(Math.random() * bdLocations.length)];
		const types = ['house', 'apartment', 'villa'];
		return {
			title: `Modern ${types[index % 3]} in ${locationData.location}`,
			location: locationData.location,
			minPrice: Math.floor(Math.random() * 50000 + 50000),
			maxPrice: Math.floor(Math.random() * 100000 + 150000),
			bedrooms: String(Math.floor(Math.random() * 3 + 2)),
			bathrooms: String(Math.floor(Math.random() * 2 + 1)),
			squareMeters: String(Math.floor(Math.random() * 500 + 100)),
			googleMap: `https://www.google.com/maps?q=${locationData.lat},${locationData.lng}`,
			propertyType: types[index % 3],
			parking: ['yes', 'no'][index % 2],
			description: `Spacious and modern ${
				types[index % 3]
			} in prime location of ${locationData.location}.`,
			images: generateRandomImages(),
			agentName: 'Seed Agent',
			agentEmail: 'seed@example.com',
			agentId: 'seedAgentId',
			agentImage: '',
			categories: ['featured', 'new', 'dhaka'],
			verificationStatus: 'verified',
			isAdvertised: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			reviews: [],
			dealStatus: null,
			coordinates: { lat: locationData.lat, lng: locationData.lng },
		};
	});
	return seed;
};
