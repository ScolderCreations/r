const express = require('express');   // latest
const fetch = require("node-fetch"); // 2.1.0
const fs = require('fs');           // builtin
var RateLimit = require('express-rate-limit');

const app = express();

const root = "/home/runner/r/"

var limiter = new RateLimit({
  windowMs: 1*60*1000, // 1 minute
  max: 50
});

// apply rate limiter to all requests
app.use(limiter);

app.get(['/', /\/index.?h?t?m?l?/], (req, res) => {
  res.sendFile('index.html', {root: root})
});

app.get('/style.css', (req, res) => {
  res.sendFile('style.css', {root: root})
});

app.get([/\/p\/[0-9]+/, /\/projects?\/[0-9]+/], (req, res) => {
  res.set('Content-Type', 'text/html');
  res.set('Link', '<../../style.css>; rel="stylesheet"');
  res.status(403).send('<div class="mono">403 Unauthorized</div>')
})

app.listen(3000, () => {
  console.log('server started');
});
