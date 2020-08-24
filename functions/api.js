const express = require('express');
const admin = require('firebase-admin');
const functions = require('firebase-functions');

admin.initializeApp(functions.config().firebase);

const api = express.Router();

api.get('/test', (req, res) => {
  res.send("holaaaaa");
});

api.post('/answer', (req, res) => {
  const { body: {name, birthDate, birthHour, baldy, argenchino, weigth} } = req;
  admin.database().ref("/answers").push({name, birthDate, birthHour, baldy, argenchino, weigth}); 
  res.send("listo");
});

module.exports = api;