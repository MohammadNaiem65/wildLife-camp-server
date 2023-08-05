const express = require('express');
const port = process.env.PORT || 5000;

// ! app initialization using middleware
var app = express();
app.use(express.json());

// * Managing the routes
app.get('/', (req, res) => {
	res.send('Welcome to Wild Life Camp');
});

app.listen(port, () => {
	console.log(`Server is running at port ${port}`);
});
