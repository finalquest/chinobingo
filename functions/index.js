const functions = require('firebase-functions');

const express = require('express');
const cors = require('cors');
const api = require('./api');

const app = express();

// Automatically allow cross-origin requests
app.use(cors());

app.use('/',api);

// build multiple CRUD interfaces:
app.get('/:id', (req, res) => res.send("hola"));
exports.api = functions.https.onRequest(app);
