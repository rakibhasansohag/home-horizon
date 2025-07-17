const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();

const uploadRoutes = require('./routes/cloudinary');

const port = process.env.PORT || 5000;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Initialize Firebase Admin
const serviceAccount = require('./firebase-config.json');
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

// Point : Middleware
app.use(
	cors({
		origin: [
			'http://localhost:3000',
			'http://localhost:5173',
			process.env.BASE_URL_NETLIFY,
			process.env.BASE_URL_SURGE,
		],
		credentials: true,
	}),
);
app.use(express.json());

app.get('/', (req, res) => res.send('🌿  Home Horizon Server is up!'));

app.use('/api/v1', uploadRoutes);

const client = new MongoClient(process.env.MONGODBURL, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

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

const seedProperties = Array.from({ length: 20 }).map((_, index) => {
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
		agentName: 'Rakib Hasan Sohag',
		agentEmail: 'rakibhasansohag133@gmail.com',
		agentId: 'JmghgsxKL6aYxI6DJB7Vi98A4uX2',
		agentImage:
			'https://lh3.googleusercontent.com/a/ACg8ocLw4hcXG7O_uazVzYUt4_CCdx0tTp-v43-hKZ_yLAkq0Pbh4GE=s96-c',
		categories: ['featured', 'new', 'dhaka'],
		verificationStatus: 'verified',
		isAdvertised: false,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		reviews: [],
		dealStatus: null,
		coordinates: {
			lat: locationData.lat,
			lng: locationData.lng,
		},
	};
});

async function run() {
	try {
		await client.connect();
		// Point: Collections
		const db = client.db('homeHorizonDB');
		const User = db.collection('users');
		const propertiesCollection = db.collection('properties');
		const reviewCollection = db.collection('reviews');
		const wishlistCollection = db.collection('wishlist');
		const offerCollection = db.collection('offers');

		// Verify Auth fire base token
		const verifyFireBaseToken = async (req, res, next) => {
			const authHeader = req.headers.authorization;
			if (!authHeader)
				return res.status(401).send({ error: 'Unauthorized access' });

			const token = authHeader.split(' ')[1];
			if (token === 'null')
				return res.status(401).send({ error: 'Unauthorized access' });

			// verify the token => firebase,
			try {
				const decodedUser = await admin.auth().verifyIdToken(token);
				req.decoded = decodedUser;
				next();
			} catch (err) {
				return res.status(403).send({ error: 'Forbidden Access' });
			}
		};

		// Verify role middleware (agent,admin)
		const verifyRole = (requiredRoles) => {
			return async (req, res, next) => {
				const uid = req.decoded?.uid;
				const user = await User.findOne({ uid });

				if (!user || !requiredRoles.includes(user.role)) {
					return res.status(403).send({ error: 'Access denied' });
				}

				req.user = user;
				next();
			};
		};

		// Future use middleware
		app.post('/jwt', async (req, res) => {
			const { token } = req.body;

			try {
				const decoded = await admin.auth().verifyIdToken(token);

				const jwtToken = jwt.sign(
					{
						uid: decoded.uid,
						email: decoded.email,
						role: decoded.role || 'user',
					},
					process.env.JWT_SECRET,
					{ expiresIn: '7d' },
				);

				res.send({ token: jwtToken });
			} catch (err) {
				console.error('JWT creation failed:', err);
				res.status(401).send({ error: 'Unauthorized' });
			}
		});

		const verifyJWT = (req, res, next) => {
			const authHeader = req.headers.authorization;
			if (!authHeader) return res.status(401).send({ error: 'Unauthorized' });

			const token = authHeader.split(' ')[1];

			jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
				if (err) return res.status(403).send({ error: 'Forbidden' });
				req.decoded = decoded;
				next();
			});
		};

		// Point: -------- public api's ---------
		// get the advertised properties
		app.get('/advertised-properties', async (req, res) => {
			try {
				const limit = parseInt(req.query.limit) || 4;

				const properties = await propertiesCollection
					.find({ isAdvertised: true })
					.sort({ createdAt: -1 })
					.limit(limit)
					.toArray();

				res.send(properties);
			} catch (err) {
				console.error(err);
				res
					.status(500)
					.send({ message: 'Failed to fetch advertised properties' });
			}
		});
		// get the latest reviews
		app.get('/latest-reviews', async (req, res) => {
			try {
				const limit = parseInt(req.query.limit) || 3;

				const reviews = await reviewCollection
					.find({})
					.sort({ createdAt: -1 })
					.limit(limit)
					.toArray();

				res.send(reviews);
			} catch (err) {
				console.error(err);
				res.status(500).send({ message: 'Failed to fetch latest reviews' });
			}
		});

		// Point:  USERS RELATED APIS
		// create user
		app.post('/users', async (req, res) => {
			const users = req.body;

			if (!users.uid || !users.email) {
				return res
					.status(400)
					.send({ error: 'UID is required OR email required' });
			}

			// for duplicated users
			const filter = { uid: users.uid };
			const update = {
				$set: { ...users, location: '', bloodGroup: '', address: '' },
			};
			const options = { upsert: true };

			const result = await User.updateOne(filter, update, options);
			return res.send(result);
		});

		// Get user role
		app.get('/users/role', verifyFireBaseToken, async (req, res) => {
			try {
				const { email, uid } = req.query;

				if (!email && !uid) {
					return res.status(400).send({ error: 'Email or UID required' });
				}

				let user = null;

				if (email) {
					user = await User.findOne({ email });
				}

				// fallback to uid if email didn’t find user
				if (!user && uid) {
					user = await User.findOne({ uid });
				}

				if (!user) {
					return res.status(404).send({ error: 'User not found' });
				}

				res.send({ role: user.role || 'user' });
			} catch (error) {
				console.error('Error getting user role:', error);
				res.status(500).send({ error: 'Internal server error' });
			}
		});

		app.get('/users/:uid', verifyFireBaseToken, async (req, res) => {
			try {
				const uid = req.params.uid;

				if (req.decoded.uid !== uid) {
					return res.status(403).send({
						error: 'Forbidden: You can only access your own profile',
					});
				}

				const user = await User.findOne({
					uid: uid,
				});

				if (!user) {
					return res.status(404).send({ error: 'user not found' });
				}
				res.send(user);
			} catch (error) {
				console.error('Error fetching user:', error);
				res.status(500).send({ error: 'Internal server error' });
			}
		});

		app.put('/users/:uid', verifyFireBaseToken, async (req, res) => {
			try {
				const uid = req.params.uid;

				if (req.decoded.uid !== uid) {
					return res.status(403).send({
						error: 'Forbidden: You can only access your own profile',
					});
				}
				const updated = req.body;

				const result = await User.updateOne(
					{ uid },
					{ $set: updated, $currentDate: { lastUpdated: true } },
					{ upsert: false },
				);
				res
					.status(200)
					.send({ message: 'Profile updated successfully', result });
			} catch (error) {
				console.error('Error updating user:', error);
				res.status(500).send({ error: 'Internal server error' });
			}
		});

		// POINT: all the properties related api
		// Get Property by Verified
		app.get('/properties/verified', async (req, res) => {
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
					...(search && {
						location: { $regex: search, $options: 'i' },
					}),
					...(swLat &&
						swLng &&
						neLat &&
						neLng && {
							'coordinates.lat': {
								$gte: parseFloat(swLat),
								$lte: parseFloat(neLat),
							},
							'coordinates.lng': {
								$gte: parseFloat(swLng),
								$lte: parseFloat(neLng),
							},
						}),
				};

				const sortOption = sort === 'asc' ? 1 : -1;

				const properties = await propertiesCollection
					.find(filter)
					.sort({ minPrice: sortOption })
					.toArray();

				res.send(properties);
			} catch (error) {
				console.error('Error fetching verified properties:', error);
				res.status(500).send({ error: 'Internal server error' });
			}
		});
		// Create a Property
		app.post(
			'/properties',
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

					const result = await propertiesCollection.insertOne(newProperty);
					res.status(201).send(result);
				} catch (error) {
					console.error('Error inserting property:', error);
					res.status(500).send({ error: 'Property insert failed' });
				}
			},
		);

		// Get My Properties (by agentId/ uid)
		app.get(
			'/my-properties',
			verifyFireBaseToken,
			verifyRole(['agent', 'super-admin']),
			async (req, res) => {
				try {
					const agentId = req.decoded.uid;
					const myProperties = await propertiesCollection
						.find({ agentId })
						.sort({ createdAt: -1 }) // newest first
						.toArray();
					res.send(myProperties);
				} catch (error) {
					console.error('Error fetching my properties:', error);
					res.status(500).send({ error: 'Internal Server Error' });
				}
			},
		);

		// Get a Property by Id
		app.get('/properties/:id', verifyFireBaseToken, async (req, res) => {
			try {
				const propertyId = req.params.id;
				const property = await propertiesCollection.findOne({
					_id: new ObjectId(propertyId),
				});

				if (!property) {
					return res.status(404).send({ error: 'Property not found' });
				}
				res.send(property);
			} catch (error) {
				console.error('Error fetching property:', error);
				res.status(500).send({ error: 'Internal server error' });
			}
		});

		// Update a Property
		app.put(
			'/properties/:id',
			verifyFireBaseToken,
			verifyRole(['agent', 'super-admin']),
			async (req, res) => {
				const propertyId = req.params.id;
				const updatedData = req.body;

				if (!ObjectId.isValid(propertyId)) {
					return res.status(400).send({ error: 'Invalid property ID' });
				}

				try {
					delete updatedData._id;

					const result = await propertiesCollection.updateOne(
						{ _id: new ObjectId(propertyId), agentId: req.decoded.uid },
						{ $set: { ...updatedData, updatedAt: new Date() } },
					);

					if (result.modifiedCount === 0) {
						return res
							.status(404)
							.send({ error: 'Property not updated or not found' });
					}

					res.send({ message: 'Property updated successfully' });
				} catch (error) {
					console.error(error);
					res.status(500).send({ error: 'Internal Server Error' });
				}
			},
		);

		app.delete(
			'/properties/:id',
			verifyFireBaseToken,
			verifyRole(['agent', 'super-admin']),
			async (req, res) => {
				const propertyId = req.params.id;

				if (!ObjectId.isValid(propertyId)) {
					return res.status(400).send({ error: 'Invalid property ID' });
				}

				try {
					const result = await propertiesCollection.deleteOne({
						_id: new ObjectId(propertyId),
						agentId: req.decoded.uid,
					});

					if (result.deletedCount === 0) {
						return res
							.status(404)
							.send({ error: 'Property not found or unauthorized' });
					}

					res.send({ message: 'Property deleted successfully' });
				} catch (error) {
					console.error(error);
					res.status(500).send({ error: 'Internal Server Error' });
				}
			},
		);

		// POINT :----- ALL THE ADMIN RELATED API HERE ----------------

		app.get(
			'/admin/properties',
			verifyFireBaseToken,
			verifyRole(['admin', 'super-admin']),
			async (req, res) => {
				try {
					// TODO : check if user role === 'admin'
					const properties = await propertiesCollection
						.find({})
						.sort({ createdAt: -1 })
						.toArray();
					res.send(properties);
				} catch (error) {
					console.error('Error fetching properties:', error);
					res.status(500).send({ error: 'Internal server error' });
				}
			},
		);

		app.patch(
			'/admin/properties/verify/:id',
			verifyFireBaseToken,
			verifyRole(['admin', 'super-admin']),
			async (req, res) => {
				try {
					const propertyId = req.params.id;
					if (!ObjectId.isValid(propertyId)) {
						return res.status(400).send({ error: 'Invalid property ID' });
					}

					const result = await propertiesCollection.updateOne(
						{ _id: new ObjectId(propertyId) },
						{
							$set: {
								verificationStatus: 'verified',
								updatedAt: new Date(),
							},
						},
					);

					if (result.modifiedCount === 0) {
						return res
							.status(404)
							.send({ error: 'Property not found or not updated' });
					}

					res.send({ message: 'Property verified successfully' });
				} catch (error) {
					console.error(error);
					res.status(500).send({ error: 'Internal Server Error' });
				}
			},
		);

		app.patch(
			'/admin/properties/reject/:id',
			verifyFireBaseToken,
			verifyRole(['admin', 'super-admin']),
			async (req, res) => {
				try {
					const propertyId = req.params.id;
					if (!ObjectId.isValid(propertyId)) {
						return res.status(400).send({ error: 'Invalid property ID' });
					}

					const result = await propertiesCollection.updateOne(
						{ _id: new ObjectId(propertyId) },
						{
							$set: {
								verificationStatus: 'rejected',
								updatedAt: new Date(),
							},
						},
					);

					if (result.modifiedCount === 0) {
						return res
							.status(404)
							.send({ error: 'Property not found or not updated' });
					}

					res.send({ message: 'Property rejected successfully' });
				} catch (error) {
					console.error(error);
					res.status(500).send({ error: 'Internal Server Error' });
				}
			},
		);

		// Get all users
		app.get(
			'/admin/users',
			verifyFireBaseToken,
			verifyRole(['admin', 'super-admin']),
			async (req, res) => {
				const users = await User.find({}).sort({ last_log_in: -1 }).toArray();
				res.send(users);
			},
		);

		// Promote to admin or agent
		app.patch(
			'/admin/users/:id/role',
			verifyFireBaseToken,
			verifyRole(['admin', 'super-admin']),
			async (req, res) => {
				const { role } = req.body; // 'admin' or 'agent'
				await User.updateOne(
					{ _id: new ObjectId(req.params.id) },
					{ $set: { role } },
				);
				res.send({ success: true });
			},
		);

		// Mark agent as fraud
		app.patch(
			'/admin/users/:id/fraud',
			verifyFireBaseToken,
			verifyRole(['admin', 'super-admin']),
			async (req, res) => {
				await User.updateOne(
					{ _id: new ObjectId(req.params.id) },
					{ $set: { role: 'fraud' } },
				);
				await propertiesCollection.deleteMany({ agentId: req.body.uid }); // delete agent's props
				res.send({ success: true });
			},
		);

		// Delete user (db + Firebase auth)
		app.delete(
			'/admin/users/:id',
			verifyFireBaseToken,
			verifyRole(['admin', 'super-admin']),
			async (req, res) => {
				const user = await User.findOne({
					_id: new ObjectId(req.params.id),
				});
				await User.deleteOne({ _id: user._id });
				await admin.auth().deleteUser(user.uid);
				res.send({ success: true });
			},
		);

		// Seed properties by admin
		app.post(
			'/admin/seed-properties',
			verifyFireBaseToken,
			verifyRole(['admin', 'super-admin']),
			async (req, res) => {
				try {
					const result = await propertiesCollection.insertMany(seedProperties);
					res.send({ success: true, inserted: result.insertedCount });
				} catch (error) {
					console.error('Seeding failed:', error);
					res.status(500).send({ error: 'Seed failed' });
				}
			},
		);

		// Get all reviews
		app.get(
			'/admin/reviews',
			verifyFireBaseToken,
			verifyRole(['admin', 'super-admin']),
			async (req, res) => {
				try {
					const reviews = await reviewCollection
						.find({})
						.sort({ createdAt: -1 })
						.toArray();
					res.send(reviews);
				} catch (error) {
					console.error('Error fetching reviews:', error);
					res.status(500).send({ error: 'Internal server error' });
				}
			},
		);
		// GET all verified properties (only for admin)
		app.get(
			'/admin/verified-properties',
			verifyFireBaseToken,
			verifyRole(['admin', 'super-admin']),
			async (req, res) => {
				try {
					const properties = await propertiesCollection
						.find({ verificationStatus: 'verified' })
						.sort({ createdAt: -1 })
						.toArray();

					res.send(properties);
				} catch (err) {
					console.error(err);
					res
						.status(500)
						.send({ message: 'Error getting verified properties' });
				}
			},
		);

		// PATCH to advertise a property
		app.patch(
			'/admin/advertise-property/:id',
			verifyFireBaseToken,
			verifyRole(['admin', 'super-admin']),
			async (req, res) => {
				try {
					const { id } = req.params;

					const result = await propertiesCollection.updateOne(
						{ _id: new ObjectId(id) },
						{ $set: { isAdvertised: true } },
					);

					res.send(result);
				} catch (err) {
					console.error(err);
					res.status(500).send({ message: 'Error advertising property' });
				}
			},
		);

		// set isAdverties = false
		app.patch(
			'/admin/unadvertise-property/:id',
			verifyFireBaseToken,
			verifyRole(['admin', 'super-admin']),
			async (req, res) => {
				try {
					const { id } = req.params;
					const result = await propertiesCollection.updateOne(
						{ _id: new ObjectId(id) },
						{ $set: { isAdvertised: false } },
					);
					res.send(result);
				} catch (err) {
					console.error(err);
					res.status(500).send({ message: 'Error un‐advertising property' });
				}
			},
		);
		// GET advertise stats
		app.get(
			'/admin/advertise‐stats',
			verifyFireBaseToken,
			verifyRole(['admin', 'super-admin']),
			async (req, res) => {
				try {
					const total = await propertiesCollection.countDocuments({
						isAdvertised: true,
					});
					res.send({ total });
				} catch (err) {
					console.error(err);
					res.status(500).send({ message: 'Error fetching advertise stats' });
				}
			},
		);
		// GET all adverties properties
		app.get('/advertised-properties', async (req, res) => {
			try {
				const properties = await propertiesCollection
					.find({ isAdvertised: true })
					.sort({ createdAt: -1 })
					.toArray();
				res.send(properties);
			} catch (err) {
				console.error(err);
				res
					.status(500)
					.send({ message: 'Error getting advertised properties' });
			}
		});

		// Point:  Wishlist
		app.post(
			'/wishlist',
			verifyFireBaseToken,
			verifyRole(['user']),
			async (req, res) => {
				const { userId, propertyId } = req.body;

				if (!userId || !propertyId) {
					return res.status(400).send({ error: 'Missing required fields' });
				}

				const wishlistItem = await wishlistCollection.findOne({
					userId,
					propertyId,
				});

				if (wishlistItem) {
					return res.status(400).send({ error: 'Item already in wishlist' });
				}
				await wishlistCollection.insertOne({
					userId,
					propertyId,
					createdAt: new Date().toISOString(),
				});
				res.send({ success: true });
			},
		);

		// Get all wishlist for a user
		app.get(
			'/wishlist',
			verifyFireBaseToken,
			verifyRole(['user', 'agent', 'admin']),
			async (req, res) => {
				try {
					const { userId } = req.query;
					if (!userId) {
						return res.status(400).send({ error: 'Missing userId' });
					}

					const wishlist = await wishlistCollection
						.find({ userId })
						.sort({ createdAt: -1 })
						.toArray();

					res.send(wishlist);
				} catch (error) {
					console.error('Error fetching wishlist:', error);
					res.status(500).send({ error: 'Internal server error' });
				}
			},
		);

		// check if the properties already in wishlist
		app.get(
			'/wishlist/check',
			verifyFireBaseToken,
			verifyRole(['user', 'admin', 'agent']),
			async (req, res) => {
				try {
					const { userId, propertyId } = req.query;

					if (!userId || !propertyId) {
						return res.status(400).send({ error: 'Missing fields' });
					}

					const existing = await wishlistCollection.findOne({
						userId,
						propertyId,
					});

					res.send({ isWishlisted: !!existing });
				} catch (error) {
					console.error('Error checking wishlist:', error);
					res.status(500).send({ error: 'Internal server error' });
				}
			},
		);

		// Remove from wishlist
		app.delete(
			'/wishlist',
			verifyFireBaseToken,
			verifyRole(['user']),
			async (req, res) => {
				try {
					const { userId, propertyId } = req.query;

					if (!userId || !propertyId) {
						return res.status(400).send({ error: 'Missing required fields' });
					}

					const result = await wishlistCollection.deleteOne({
						userId,
						propertyId,
					});

					if (result.deletedCount === 0) {
						return res
							.status(404)
							.send({ error: 'Item not found in wishlist' });
					}

					res.send({ success: true });
				} catch (error) {
					console.error('Error removing wishlist:', error);
					res.status(500).send({ error: 'Internal server error' });
				}
			},
		);

		//  wishlist properties
		app.post(
			'/wishlist/properties',
			verifyFireBaseToken,
			verifyRole(['user']),
			async (req, res) => {
				try {
					const { propertyIds } = req.body;

					if (!Array.isArray(propertyIds)) {
						return res.status(400).send({ error: 'Invalid propertyIds' });
					}

					const objectIds = propertyIds.map((id) => new ObjectId(id));
					const properties = await propertiesCollection
						.find({ _id: { $in: objectIds } })
						.toArray();

					res.send(properties);
				} catch (error) {
					console.error('Error fetching wishlist properties:', error);
					res.status(500).send({ error: 'Internal server error' });
				}
			},
		);

		// Point :  Reviews
		app.get('/reviews/:propertyId', verifyFireBaseToken, async (req, res) => {
			const { propertyId } = req.params;

			const reviews = await reviewCollection.find({ propertyId }).toArray();
			res.send(reviews);
		});

		app.post('/reviews', verifyFireBaseToken, async (req, res) => {
			const {
				propertyId,
				userId,
				agentId,
				reviewText,
				rating,
				userImage,
				userName,
				userEmail,
				propertyTitle,
				agentName,
			} = req.body;

			const result = await reviewCollection.insertOne({
				propertyId,
				userId,
				agentId,
				reviewText,
				rating,
				createdAt: new Date().toISOString(),
				userImage,
				userName,
				userEmail,
				propertyTitle,
				agentName,
			});
			res.status(201).send(result);
		});

		// Get my reviews by uid
		app.get('/my-reviews', verifyFireBaseToken, async (req, res) => {
			const { uid } = req.query;
			const reviews = await reviewCollection.find({ userId: uid }).toArray();
			res.send(reviews);
		});

		// Delete review by ID
		app.delete('/reviews/:id', verifyFireBaseToken, async (req, res) => {
			console.log(req.params.id);
			const result = await reviewCollection.deleteOne({
				_id: new ObjectId(req.params.id),
			});
			res.send({ success: result.deletedCount > 0 });
		});

		// Point: ----------- offers related api ------------
		// submit a new offer
		app.post(
			'/offers',
			verifyFireBaseToken,
			verifyRole(['user']),
			async (req, res) => {
				const {
					propertyId,
					agentId,
					agentName,
					propertyTitle,
					propertyLocation,
					minPrice,
					maxPrice,
					offerAmount,
					buyerId,
					buyerName,
					buyerEmail,
					buyingDate,
					updatedAt,
					propertyImage,
				} = req.body;

				// Check required fields
				if (
					!propertyId ||
					!agentId ||
					!offerAmount ||
					!buyerId ||
					!propertyTitle ||
					!propertyLocation
				) {
					return res.status(400).send({ error: 'Missing required fields' });
				}

				// check if the the user already made an offer
				const existingOffer = await offerCollection.findOne({
					propertyId,
					buyerId,
				});

				if (existingOffer) {
					return res.status(400).send({ error: 'You already made an offer' });
				}

				// Validate offer amount
				if (offerAmount < minPrice || offerAmount > maxPrice) {
					return res.status(400).send({
						error: `Offer must be between ${minPrice} and ${maxPrice} BDT`,
					});
				}

				// Add offer
				await offerCollection.insertOne({
					propertyId,
					propertyTitle,
					propertyLocation,
					agentId,
					agentName,
					minPrice,
					maxPrice,
					offerAmount,
					buyerId,
					buyerName,
					buyerEmail,
					buyingDate,
					status: 'pending',
					createdAt: new Date().toISOString(),
					updatedAt,
					propertyImage,
				});

				// Update user wishlist or remove from the wishlist
				await wishlistCollection.deleteOne({
					userId: buyerId,
					propertyId,
				});

				res.send({ success: true });
			},
		);

		// get all offers of a user
		app.get(
			'/offers',
			verifyFireBaseToken,
			verifyRole(['user']),
			async (req, res) => {
				const { email } = req.query;

				if (!email) return res.status(400).send({ error: 'Missing email' });

				const offers = await offerCollection
					.find({ buyerEmail: email })
					.toArray();
				res.send(offers);
			},
		);

		// get all offers of a user
		app.get('/offers/user', verifyFireBaseToken, async (req, res) => {
			const { email, propertyId } = req.query;

			const offer = await offerCollection.findOne({
				buyerEmail: email,
				propertyId,
			});
			res.send(offer);
		});

		// Point : ------------ All agent related api -----------
		app.get(
			'/agent/offers',
			verifyFireBaseToken,
			verifyRole(['agent']),
			async (req, res) => {
				try {
					const agentId = req.decoded.uid;

					const offers = await offerCollection
						.find({ agentId })
						.sort({ createdAt: -1 })
						.toArray();
					res.send(offers);
				} catch (error) {
					console.error('Error fetching agent offers:', error);
					res.status(500).send({ error: 'Internal server error' });
				}
			},
		);

		// Accept or Reject an offer
		app.patch(
			'/agent/offers/:id/status',
			verifyFireBaseToken,
			verifyRole(['agent']),
			async (req, res) => {
				const { id } = req.params;
				const { status, propertyId } = req.body;
				if (!['accepted', 'rejected'].includes(status)) {
					return res.status(400).send({ error: 'Invalid status' });
				}

				if (!propertyId) {
					return res.status(400).send({ error: 'Missing propertyId' });
				}

				try {
					// Update the selected offer
					await offerCollection.updateOne(
						{ _id: new ObjectId(id) },
						{ $set: { status, updatedAt: new Date() } },
					);

					// Update the property status
					await propertiesCollection.updateOne(
						{ _id: new ObjectId(propertyId) },
						{ $set: { status } },
					);

					console.log('Rejecting other offers where:', {
						propertyId: propertyId,
						excludedOfferId: id,
					});
					// Auto-reject other offers for the same property if accepted
					if (status === 'accepted') {
						const result = await offerCollection.updateMany(
							{
								propertyId: propertyId,
								_id: { $ne: new ObjectId(id) },
							},
							{
								$set: {
									status: 'rejected',
									updatedAt: new Date().toISOString(),
								},
							},
						);
						console.log('Rejected offers:', result.modifiedCount);
					}

					res.send({ success: true });
				} catch (error) {
					console.error('Error updating offer status:', error);
					res.status(500).send({ error: 'Internal server error' });
				}
			},
		);

		app.get(
			'/agent/sold-properties',
			verifyFireBaseToken,
			verifyRole(['agent']),
			async (req, res) => {
				try {
					const agentId = req.decoded.uid;

					const soldOffers = await offerCollection
						.find({ agentId, status: 'bought' })
						.sort({ paidAt: -1 })
						.toArray();

					const propertyIds = soldOffers.map(
						(offer) => new ObjectId(offer.propertyId),
					);
					const properties = await propertiesCollection
						.find({ _id: { $in: propertyIds } })
						.toArray();

					const enriched = soldOffers.map((offer) => {
						const property = properties.find(
							(p) => p._id.toString() === offer.propertyId,
						);

						return {
							...offer,
							propertyTitle: property?.title || 'N/A',
							propertyLocation: property?.location || 'N/A',
						};
					});

					res.send(enriched);
				} catch (error) {
					console.error('Error fetching sold properties:', error);
					res.status(500).send({ error: 'Something went wrong' });
				}
			},
		);

		// Point:--------- All Payment Related Apis ------------
		app.post(
			'/create-checkout-session',
			verifyFireBaseToken,
			async (req, res) => {
				const { offerId } = req.body;
				const uid = req.decoded.uid;

console.log('BODY:', req.body);
console.log('UID:', req.decoded?.uid);

if (!offerId) {
	return res.status(400).send({ error: 'Offer ID is required' });
}

const offer = await offerCollection.findOne({
	_id: new ObjectId(offerId),
});

if (!offer) {
	return res.status(404).send({ error: 'Offer not found' });
}

if (offer.buyerId !== uid) {
	return res.status(403).send({ error: 'Unauthorized access' });
}

if (!offer || offer.status !== 'accepted') {
	return res.status(404).send({ error: 'Valid accepted offer not found' });
}

if (offer.status !== 'accepted') {
	return res.status(400).send({ error: 'Offer is not accepted' });
}

if (typeof offer.offerAmount !== 'number') {
	console.log('Invalid amount', offer.offerAmount);
	return res.status(400).send({ error: 'Invalid offer amount' });
}

const session = await stripe.checkout.sessions.create({
	payment_method_types: ['card'],
	line_items: [
		{
			price_data: {
				currency: 'bdt',
				product_data: {
					name: `Property: ${offer.propertyTitle}`,
				},
				unit_amount: offer.offerAmount * 100,
			},
			quantity: 1,
		},
	],
	mode: 'payment',
	success_url: `${
		process.env.BASE_URL_SURGE ||
		process.env.BASE_URL_NETLIFY ||
		'http://localhost:5173'
	}/dashboard/payment-success?session_id={CHECKOUT_SESSION_ID}`,
	cancel_url: `${
		process.env.BASE_URL_SURGE ||
		process.env.BASE_URL_NETLIFY ||
		'http://localhost:5173'
	}/payment-cancelled`,
	metadata: {
		offerId: offerId,
		buyerId: offer.buyerId,
		propertyId: offer.propertyId,
	},
});

				res.send({ url: session.url });
			},
		);

		app.post('/payments/verify', async (req, res) => {
			const { sessionId } = req.body;
			// fetch session using Stripe secret
			const session = await stripe.checkout.sessions.retrieve(sessionId);

			if (session.payment_status !== 'paid') {
				return res.status(400).send({ error: 'Payment not completed' });
			}

			const { offerId } = session.metadata;
			const transactionId = session.payment_intent;
			const amount = session.amount_total / 100;

			const offer = await offerCollection.findOne({
				_id: new ObjectId(offerId),
			});
			if (!offer) {
				return res.status(404).send({ error: 'Offer not found' });
			}

			await offerCollection.updateOne(
				{ _id: new ObjectId(offerId) },
				{
					$set: {
						isPaid: true,
						transactionId,
						amount,
						paidAt: new Date().toISOString(),
						updatedAt: new Date(),
						sessionId,
						status: 'bought',
					},
				},
			);

			await propertiesCollection.updateOne(
				{ _id: new ObjectId(offer.propertyId) },
				{
					$set: {
						dealStatus: 'sold', // ✅ mark it as sold
						updatedAt: new Date().toISOString(),
					},
				},
			);

			res.send({ success: true });
		});

		// Send a ping to confirm a successful connection
		await client.db('admin').command({ ping: 1 });
		console.log(
			'Pinged your deployment. You successfully connected to MongoDB!',
		);
	} catch (error) {
		console.log(`error connecting to mongoDB ${error}`);
	} finally {
		//  await client.close();
	}
}
run().catch(console.dir);

app.listen(port, () => {
	console.log(`Home Horizon  server is running on port: ${port}`);
});
