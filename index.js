const express = require('express');               // latest
const fetch = require("node-fetch");             // 2.1.0
const fs = require('fs');                       // builtin
var rateLimit = require('express-rate-limit'); // latest

function getProject(id) {
  return JSON.parse(fs.readFileSync('projects.json'))[id]
}

function renderReview(review) {
  let html = '<review>';
  html += '<username>' + review[0].replaceAll(/[\>\<]/g, '') + '</username>';
  html += `<userscore style="background-color: ${review[1] > 75 ? '#039e0d' : (review[1] > 45 ? '#9e9903' : '#9e030b')}">` + Math.floor(Number(review[1])) + '</userscore>'
  html += '<quote>' + review[2].replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('\n', '<br />')
    .replaceAll('[b]', '<b>')
    .replaceAll('[i]', '<i>')
    .replaceAll('[u]', '<u>')
    .replaceAll('[s]', '<s>')
    .replaceAll(/\[\/([bius])\]/ig, `</$1>`)
    + '</quote>';
  return html + '</review>'
}

function renderProjects(a) {
  return a.map(
    (project) => {
      let html = "<div class=container>";
      html += `<img src='https://cdn2.scratch.mit.edu/get_image/project/${project.id}_480x360.png' height='67%' width='100%' style='max-width: 480px; max-height: 360px;' />`
      html += `</div><div class=container>
                 <h1 class=gameTitle>${project.title}</h1>
               </div>`
      html += `<div class=container>
               <card>
                (see <a href="/projects/${project.id}">${project.reviews} reviews</a>) (view on <a href="https://scratch.mit.edu/projects/${project.id}">Scratch</a>)
               </card>
               </div>`
      return html;
    }).join("<br />");
}

function getScore(array) {
  let scores = [];
  var score;
  array.forEach((r) => {
    scores.push(r[1])
  })
  if (scores.length > 0) {
    score = Math.floor(scores.reduce((partialSum, a) => partialSum + a, 0) / (scores.length))
  } else { score = "N/A" }
  return score;
}

function projectPage(id) {
  let dat = getProject(id);
  return String(fs.readFileSync('project.html'))
    .replaceAll('%ID', id)
    .replaceAll('%TITLE', dat.name)
    .replaceAll('%AUTHOR', dat.creator)
    .replace('%DESC', dat.description.replaceAll("\n", "<br />").replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig, "<a href='$1' target='_blank'>$1</a>"))
    .replaceAll('%DATE',
      new Date(Date.parse(dat.released)).toString().replace(' ', ', ')
    )
    .replaceAll('%RATING', `<span style="color: ${getScore(dat.reviews) > 75 ? 'green' : (getScore(dat.reviews) > 45 ? 'yellow' : (typeof getScore(dat.reviews) != "number") ? 'white' : 'red')};">` + getScore(dat.reviews) + '</span>')
    .replace('%REVIEWS', dat.reviews.map(renderReview).join(''))
}

function sortByRating(a, b) {
  if ([a, b].includes("N/A")) return (a == "N/A") - (b == "N/A");
  return b - a;
}

const app = express();

const root = "/home/runner/r/";

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter)

app.get(['/', /\/index.?h?t?m?l?/], (req, res) => {
  res.send(String(fs.readFileSync('index.html')).replace('<CRCOUNT />', String(JSON.parse(fs.readFileSync('projects.json'))[434825906]['reviews'].length)))
});

app.get('/style.css', (req, res) => {
  res.sendFile('style.css', { root: root })
});

app.get([/\/p\/[0-9]+/, /\/projects?\/[0-9]+/], (req, res) => {
  res.send(projectPage(req.path.match(/[0-9]+/)[0]))
})

app.get(/api\/[0-9]+\/count/, (req, res) => {
  res.send(String(JSON.parse(fs.readFileSync('projects.json'))[req.path.match(/[0-9]+/)[0]]['reviews'].length))
});

app.get(["/explore", "/all", /projects\/?/], (req, res) => {
  let projectsFile = JSON.parse(fs.readFileSync('projects.json'));
  res.send(`<!DOCTYPE html>
<html>
<head>
  <title>SPRB - Explore</title>
  <link href="../style.css" rel=stylesheet />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Explore reviews for Scratch Projects.">
</head>
<body>
<div class=container>
  <header><h1>Scratch Project Review Board</h1> <h3><a href="/">Home</a></h3></header>
</div><br />${renderProjects(Object.keys(projectsFile).slice(0, 25).map((id) => {
    let obj = Object();
    obj.id = id;
    obj.reviews = projectsFile[id].reviews.length;
    obj.title = projectsFile[id].name;
    obj.rating = getScore(projectsFile[id].reviews);
    return obj;
  }).sort(sortByRating))}`)
});

app.listen(3000, () => {
  console.log('server started');
});

