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
			const classes = await classesCollection
				.find({ status: 'approved' })
				.toArray();
			res.send(classes);
		});

		app.get('/classes/6', async (req, res) => {
			const classes = await classesCollection
				.find({ status: 'approved' })
				.sort({ seats: 1 })
				.limit(6)
				.toArray();
			res.send(classes);
		});

		app.get('/classes/class/:id', async (req, res) => {
			const id = req.params.id;
			const options = {
				projection: { name: 1, price: 1, img: 1 },
			};
			const result = await classesCollection.findOne(
				{
					_id: new ObjectId(id),
				},
				options
			);
			res.send(result);
		});

		app.patch('/classes/class/:id', async (req, res) => {
			const id = req.params.id;
			const data = req.body;
			const { name, img, price, status } = data;
			const query = {
				_id: new ObjectId(id),
			};
			const updatedData = {
				$set: {
					name,
					img,
					price,
					status,
				},
			};
			const result = await classesCollection.updateOne(
				query,
				updatedData
			);
			res.send(result);
		});

		app.delete('/classes/class/:id', async (req, res) => {
			const id = req.params.id;
			const result = await classesCollection.deleteOne({
				_id: new ObjectId(id),
			});
			res.send(result);
		});

		// ! Student related classes API's
		app.patch('/student/class/select/:id', async (req, res) => {
			const id = req.params.id;
			const email = req.query.email;

			const updatedDoc = {
				$push: {
					selectedClasses: id,
				},
			};
			const result = await usersCollection.updateOne(
				{ email },
				updatedDoc
			);
			res.send(result);
		});

		app.get('/student/classes/selected', (req, res) => {
			const email = req.query.email;

			// Get selected classes id 
			const getClassesId = async () => {
				const options = { projection: { _id: 0, selectedClasses: 1 } };
				const result = await usersCollection.findOne(
					{ email: email },
					options
				);
				return result.selectedClasses;
			};

			// Get the selected classes details
			const getClasses = async (classIds) => {
				const classes = [];
				const options = {
					projection: {
						status: 0,
						instructor_email: 0,
					},
				};
				for (const id of classIds) {
					const c = await classesCollection.findOne(
						{
							_id: new ObjectId(id),
						},
						options
					);
					classes.push(c);
				}
				return classes;
			};

			getClassesId()
				.then((classIds) => getClasses(classIds))
				.then((classes) => res.send(classes))
				.catch((err) => res.status(500).send(err));
		});

		// ! Instructor related classes API's
		app.get('/instructor/classes', async (req, res) => {
			const email = req.query.email;
			const options = { projection: { name: 1, attended: 1, status: 1 } };
			const usersClasses = await classesCollection
				.find({ instructor_email: email }, options)
				.toArray();
			res.send(usersClasses);
		});

		app.post('/instructor/classes/class', async (req, res) => {
			const classData = req.body;
			const result = await classesCollection.insertOne(classData);
			res.send(result);
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
