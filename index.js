const express = require('express'); // latest
const fetch = require("node-fetch"); // 2.1.0

const app = express();

const root = "/home/runner/r/"

app.get('/', (req, res) => {
  res.sendFile('index.html', {root: root})
});

app.get('/style.css', (req, res) => {
  res.sendFile('style.css', {root: root})
});

app.listen(3000, () => {
  console.log('server started');
});