const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

// ! app initialization using middleware
var app = express();
app.use(express.json());
app.use(cors());

// ! Connect Database

const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function run() {
	try {
		// Connect the client to the server
		await client.connect();

		// ! Get the collections
		const usersCollection = client.db('wildLifeCamp').collection('users');
		const classesCollection = client
			.db('wildLifeCamp')
			.collection('classes');

		// * Managing the routes
		app.get('/', (req, res) => {
			res.send('Welcome to Wild Life Camp');
		});

		// ! User related API's
		app.post('/users', async (req, res) => {
			const userData = req.body;
			console.log(userData);
		});

		app.get('/users/role', async (req, res) => {
			const email = req.query.email;
			const roleObj = await usersCollection.findOne(
				{ email: email },
				{ projection: { role: 1, _id: 0 } }
			);
			res.send(roleObj);
		});

		app.post('/users/role', async (req, res) => {
			const newUser = req.body;
			const result = await usersCollection.insertOne(newUser);
			res.send(result);
		});

		// ! Instructor related API's
		app.get('/users/instructors', async (req, res) => {
			const instructors = await usersCollection
				.find({ role: 'instructor' }, { sort: { name: 1 } })
				.toArray();
			res.send(instructors);
		});

		app.get('/users/instructors/6', async (req, res) => {
			const instructors = await usersCollection
				.find({ role: 'instructor' })
				.limit(6)
				.toArray();
			res.send(instructors);
		});

		// ! Class related API's
		app.get('/classes', async (req, res) => {
			const classes = await classesCollection.find().toArray();
			res.send(classes);
		});

		app.get('/classes/6', async (req, res) => {
			const classes = await classesCollection
				.find()
				.sort({ seats: 1 })
				.limit(6)
				.toArray();
			res.send(classes);
		});

		app.get('/instructor/classes', async (req, res) => {
			const email = req.query.email;
			const options = { projection: { name: 1, attended: 1, status: 1 } };
			const usersClasses = await classesCollection
				.find({ instructor_email: email }, options)
				.toArray();
			res.send(usersClasses);
		});

		// Send a ping to confirm a successful connection
		await client.db('admin').command({ ping: 1 });
		console.log(
			'Pinged your deployment. You successfully connected to MongoDB!'
		);
	} catch (err) {
		console.log(err);
	}
}
run().catch(console.dir);

app.listen(port, () => {
	console.log(`Server is running at port ${port}`);
});
