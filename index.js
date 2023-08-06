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
		const classesCollection = client
			.db('wildLifeCamp')
			.collection('classes');
		const instructorsCollection = client
			.db('wildLifeCamp')
			.collection('instructors');

		// * Managing the routes
		app.get('/', (req, res) => {
			res.send('Welcome to Wild Life Camp');
		});

		app.get('/classes', async (req, res) => {
			const classes = await classesCollection.find().toArray();
			res.send(classes);
		});

		app.get('/classes/6', async (req, res) => {
			const classes = await classesCollection.find().toArray();
			const topClasses = classes
				.sort((a, b) => a.seats - b.seats)
				.slice(0, 6);
			res.send(topClasses);
		});

		app.get('/instructors', async (req, res) =>{
			const instructors = await instructorsCollection.find().toArray()
			res.send(instructors);
		})

		app.get('/instructors/6', async (req, res) => {
			const instructors = await instructorsCollection.find().toArray();
			const topInstructors = instructors.slice(0, 6);
			res.send(instructors);
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
