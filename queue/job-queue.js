// Job Queue receives a chapter, and processes chapters to
//   be scraped sequentially
const scraper = require('../scraper/scrape');
const store = require('../storage/store');

async function addChaptersIfNeeded (idData) {
  try {
    let seriesArray = [];
    for (const series of idData) {
      let value = null;
      value = await store.seriesExists(series);
      if (value !== false && value !== true) {
        throw value;
      }
      if (value === false) {
        seriesArray.push(series);
      }
    }
    if (seriesArray.length !== 0) {
      await scraper.scrapeMyList(seriesArray);
    }
  } catch (e) {
    console.error("Error - addChaptersIfNeeded: " + e);
  }
}

exports.__esModule = true;
exports.addChaptersIfNeeded = addChaptersIfNeeded;
