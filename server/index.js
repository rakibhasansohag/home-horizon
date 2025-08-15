require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { connectToDB } = require('./config/db');
const firebaseAdmin = require('./firebaseAdmin');

const cloudinaryRoutes = require('./routes/cloudinary');
const usersRoutes = require('./routes/users');
const propertiesRoutes = require('./routes/properties');
const offersRoutes = require('./routes/offers');
const agentRoutes = require('./routes/agent');
const adminRoutes = require('./routes/admin');
const reviewsRoutes = require('./routes/reviews');
const wishlistRoutes = require('./routes/wishlist');
const paymentsRoutes = require('./routes/payments');
const publicRoutesFactory = require('./routes/public');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const port = process.env.PORT || 5000;

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

// Health
app.get('/', (req, res) => res.send('🌿 Home Horizon Server is up!'));

// API route prefixes
app.use('/api/v1', cloudinaryRoutes);
app.use('/api/v1/public', publicRoutesFactory);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/properties', propertiesRoutes);
app.use('/api/v1/offers', offersRoutes);
app.use('/api/v1/agent', agentRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/reviews', reviewsRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/payments', paymentsRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

async function start() {
	try {
		await connectToDB();
		app.listen(port, () => {
			console.log(`Home Horizon server running on port ${port}`);
		});
	} catch (err) {
		console.error('Failed to start server', err);
		process.exit(1);
	}
}

start();
