const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://mongo:27017/mydatabase',{ useNewUrlParser: true, useUnifiedTopology: true })

// Serve static files from the Angular app
app.use(express.static(path.join(__dirname, 'client/dist/client')));

// API routes
app.get('/api', (req, res) => {
    res.send('API Works!');
});

// All other routes should serve the Angular app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/client/index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on https://localhost:${port}`)
});