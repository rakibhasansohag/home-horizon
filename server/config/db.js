const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGODBURL, {
	serverApi: {
		version: '1',
		strict: true,
		deprecationErrors: true,
	},
});

let db;

async function connectToDB() {
	// TODO : ALways stop the client.connect() for server relase
	await client.connect();
	db = client.db('homeHorizonDB');
	console.log('Connected to MongoDB');
}

function getCollection(name) {
	if (!db) throw new Error('Database not connected. Call connectToDB first.');
	return db.collection(name);
}

module.exports = {
	connectToDB,
	getCollection,
};
