const { ObjectId } = require('mongodb');
const { getCollection } = require('../config/db');

function toId(value) {
	const text = String(value || '');
	if (!/^[a-f0-9]{24}$/i.test(text)) return null;
	return new ObjectId(text);
}

async function withReviewCredits(reviews) {
	if (!Array.isArray(reviews) || reviews.length === 0) return reviews || [];

	const Properties = getCollection('properties');
	const Users = getCollection('users');
	const propertyIds = [
		...new Set(reviews.map((review) => toId(review.propertyId)).filter(Boolean)),
	];
	const uids = [...new Set(reviews.map((review) => review.userId).filter(Boolean))];
	const emails = [
		...new Set(reviews.map((review) => review.userEmail).filter(Boolean)),
	];
	const userQuery = [];
	if (uids.length) userQuery.push({ uid: { $in: uids } });
	if (emails.length) userQuery.push({ email: { $in: emails } });

	const [properties, users] = await Promise.all([
		propertyIds.length
			? Properties.find({ _id: { $in: propertyIds } })
					.project({ title: 1, location: 1, images: 1, agentName: 1 })
					.toArray()
			: [],
		userQuery.length
			? Users.find({ $or: userQuery })
					.project({
						uid: 1,
						name: 1,
						email: 1,
						profilePic: 1,
						photoURL: 1,
					})
					.toArray()
			: [],
	]);

	const homes = new Map(properties.map((home) => [String(home._id), home]));
	const people = new Map();
	for (const person of users) {
		if (person.uid) people.set(person.uid, person);
		if (person.email) people.set(person.email, person);
	}

	return reviews.map((review) => {
		const home = homes.get(String(review.propertyId));
		const person = people.get(review.userId) || people.get(review.userEmail);
		const image = home?.images?.[0]?.url || '';
		return {
			...review,
			userName: review.userName || person?.name || '',
			userEmail: review.userEmail || person?.email || '',
			userImage: review.userImage || person?.profilePic || person?.photoURL || '',
			agentName: review.agentName || home?.agentName || '',
			propertyTitle: review.propertyTitle || home?.title || '',
			property: home
				? {
						_id: String(home._id),
						title: home.title || '',
						location: home.location || '',
						image,
					}
				: null,
		};
	});
}

module.exports = { withReviewCredits };
