const express = require('express'); // latest
const fetch = require("node-fetch"); // 2.1.0

const app = express();

app.get('/', (req, res) => {
  res.send('shovel knight')
});

app.listen(3000, () => {
  console.log('server started');
});

updateDB()