const express = require('express');
const fetch = require("node-fetch");

const app = express();

var data = {};

function updateDB() {
  let id = (Math.random() * 715267356) + 500;
  
updateDB()

setInterval(updateDB, 500000);

app.get('/', (req, res) => {
  res.send('shovel knight')
});

app.listen(3000, () => {
  console.log('server started');
});
