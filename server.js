const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://mongo:27017/mydatabase');

// Middleware to handle JSON requests
app.use(express.json());

// API routes
app.get('/api', (req, res) => {
    res.send('API Works!');
});

// Serve static files from the Angular app
app.use(express.static(path.join(__dirname, 'client/dist/client')));

// All other routes should serve the Angular app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/client/index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
