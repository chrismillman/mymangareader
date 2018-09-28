const express = require('express');
const scraper = require('./scraper/scrape');
const store = require('./storage/store');
const queue = require('./queue/job-queue');
const builder = require('./builder/build');
const router = express.Router();
const app = express();
const port = 9000;

const SIX_HOURS = 21600000;
process.env.GOOGLE_APPLICATION_CREDENTIALS = "./storage/keyfile.json";

let idData = [{name: "One-Piece", number: 920},
              {name: "Boku-no-Hero-Academia", number: 229},
              {name: "Onepunch-Man", number: 131},
              {name: "Shokugeki-no-Soma", number: 307},
              {name: "Horimiya", number: 95},
              {name: "Monster-Musume-no-Iru-Nichijou", number: 34},
              {name: "Sewayaki-Kitsune-no-Senko-san", number: 25},
              {name: "Please-don-t-bully-me-Nagatoro", number: 39},
              {name: "Iinazuke-Kyoutei", number: 49},
              {name: "New-Game", number: 9},
              {name: "Wa", number: 0}
            ];

let badData = [{name: "Naruto", number: 0}];

let myData = [{name: "One-Piece", number: 100, images: ["https://2.bp.blogspot.com/-A4PCayVidnU/W3-inJB6UCI/AAAAAAAEB4g/RDjJ4P2jmOEbDYjhdgijwgEZyHK5UQBPgCHMYCw/s0/000.png", "https://2.bp.blogspot.com/-njIxIBOOtIw/W3-irtvjDcI/AAAAAAAEB5c/JPaslIw-MMQY7n8ykMEgksp-9hq9TfNIACHMYCw/s0/015.png"]},
              {name: "Boku-no-Hero-Academia", number: 195, images: ["https://2.bp.blogspot.com/-2fz-0g_4xFs/W3_gOSYX6pI/AAAAAAAECxA/btC24EOJNeAoac-xEsyo9jFMVsNk44QfQCHMYCw/s0/000.png", "https://2.bp.blogspot.com/-6raabTcPp1c/W3_gPFYMR6I/AAAAAAAECxI/LFOTtn3yW4QEaEvKTT3Wqb1WJ1F8gO_QwCHMYCw/s0/002.png"]}
              ];

let userData = ["One-Piece", "Boku-no-Hero-Academia", "Onepunch-Man", "Shokugeki-no-Soma"];

let allSeries = ["One-Piece", "Boku-no-Hero-Academia", "Onepunch-Man", "Shokugeki-no-Soma", "Wa", "Monster-Musume-no-Iru-Nichijou", "Horimiya", "Sewayaki-Kitsune-no-Senko-san", "Ayakashiko", "Please-don't-bully-me,-Nagatoro", "Iinazuke-Kyoutei", "New-Game!"];

let bodyParser = require('body-parser');
let urlencodedParser = bodyParser.urlencoded({ extended: false });


app.use(express.static(__dirname + '/public'));

app.param('name', function(req, res, next, name) {
  req.name = name;
  next();
});

app.get('/user/:name', urlencodedParser, function(req, res) {
  let user_id = req.name;
  console.log(`processing page for ${user_id}...`);

  // Get the user_id's chapter info
  res.setHeader('Content-Type', 'application/json');
  builder.buildView(user_id, (builtChapters) => {
    res.status(200).send(builtChapters);
  });
});

app.get('/remove/:name/:series', function(req, res) {
  let user_id = req.name;
  //console.log(`remove request for ${user_id}...`);
  let series = req.params.series;
  builder.removeChapter(user_id, series, () => {
    res.status(200);
  });
});

app.get('/previous/:name/:series', function(req, res) {
  let user_id = req.params.name;
  //console.log(`previous request for ${user_id}...`);
  let series = req.params.series;
  builder.previousChapter(user_id, series, (images) => {
    res.status(200).send(images);
  });
});

app.get('/next/:name/:series', function(req, res) {
  let user_id = req.params.name;
  //console.log(`next request for ${user_id}...`);
  let series = req.params.series;
  builder.nextChapter(user_id, series, (images) => {
    res.status(200).send(images);
  });
});

app.post('/add-series/:name/:data', urlencodedParser, function(req, res) {
  console.log("adding series...");
  console.log("got: " + req.params.data);
  let user_id = req.params.name;
  console.log("hello " + user_id);
  //console.log("adding series " + req.body.series_input + "...");
  res.status(200);
});

app.post('/', function(req, res) {
  console.log("Hello!");
  res.status(200).send("Hello from server!");
});

app.listen(port, (err) => {
  if (err) {
    throw err;
  }
  console.log('mymangareader listening on port 9000')
});

// Functions on start up and updating series
startUp();
async function startUp() {
  let seriesIndex = await store.downloadSeriesIndex();
  //scraper.scrapeNewest(seriesIndex);
  setInterval(getNewestChapters, SIX_HOURS);
  async function getNewestChapters() {
    console.log("Updating newest chapters...");
    seriesIndex = await store.downloadSeriesIndex();
    scraper.scrapeNewest(seriesIndex);
  }
  //store.uploadUser({name: "chris", series: idData});
  //store.downloadUser("newUser");
  queue.addChaptersIfNeeded(idData);
  //store.uploadSeriesIndex("Nichijou");
  // todo - be able to grab all series from seriesIndex
  //scraper.scrapeAllChapters("Wa");  
}
