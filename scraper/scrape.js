const puppeteer = require('puppeteer');
const store = require('../storage/store');
const queue = require('../queue/job-queue');
const pageBase = 'http://kissmanga.com/Manga/';

async function scrapeMyList (seriesList) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  try {
    page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36");
    page.setDefaultNavigationTimeout(90000);

    // Go through all the series in the series list
    for (const series of seriesList) {
      let imageList = [];
      await page.goto(pageBase + series.name);
      console.log(`scraping ${series.name}`);

      let chapterNumbers = '#leftside > div:nth-child(4) > div.barContent.chapterList > div:nth-child(2) > table > tbody > tr';

      await page.waitForSelector(chapterNumbers);
      let chapters = await page.$$(chapterNumbers);
      chapters = chapters.slice(2);
      let chapterList = [];

      for (const chapter of chapters) {
        //let chapterLocation = 'tr > td'
        chapterList.push(chapter);
      }
      chapterList.reverse();

      store.updateLatestChapter(series.name, chapterList.length-1);

      // Go get the chapter for that series I'm on
      let chapterLink = await chapterList[series.number].$('a');
      const chapterName = await chapterList[series.number].$eval('a', a => a.innerText);
      chapterLink.click();

      // Set the webpage to be in all pages mode
      await page.waitForSelector('#selectReadType');
      await page.select("#selectReadType", "1");

      await page.waitForSelector('#divImage > p');
      let images = await page.$$('#divImage > p');

      // Get the url and add it to the series list
      for (let image of images) {
        let imageURL = await image.$eval('img', img => img.src);
        if (imageURL === await page.url()) {
          console.log("PANIC!!!");
          await setTimeout(() => {},3000);
          imageURL = await image.$eval('img', img => img.src);
        }
        imageList.push(String(imageURL));
      }
      series.images = imageList;
      await store.uploadChapter(series);
    }
  } catch (e) {
    console.log("Error - scrapeMyList: "+e);
  }
  await browser.close();
}

async function scrapeNewest (seriesList) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  try {
    page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36");
    page.setDefaultNavigationTimeout(90000);

    // Go through all the series in the series list
    let newest = [];
    for (const series of seriesList) {
      let imageList = [];
      await page.goto(pageBase + series.name);

      let chapterNumbers = '#leftside > div:nth-child(4) > div.barContent.chapterList > div:nth-child(2) > table > tbody > tr';
      await page.waitForSelector(chapterNumbers);
      let chapters = await page.$$(chapterNumbers);
      chapters = chapters.slice(2);
      let chapterList = [];

      for (const chapter of chapters) {
        //let chapterLocation = 'tr > td'
        chapterList.push(chapter);
      }
      let newestChapter = {name: series.name, number: chapterList.length-1};
      newest.push(newestChapter);
      store.updateLatestChapter(series.name, chapterList.length-1);
    }
    await queue.addChaptersIfNeeded(newest);
  } catch (e) {
    console.log("Error - scrapeNewest: "+e);
  }
  await browser.close();
}

async function scrapeAllChapters (seriesName) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  let allChapters = [];

  try {
    page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36");
    page.setDefaultNavigationTimeout(90000);

    // Go through all the series in the series list
    await page.goto(pageBase + seriesName);

    let chapterNumbers = '#leftside > div:nth-child(4) > div.barContent.chapterList > div:nth-child(2) > table > tbody > tr';
    await page.waitForSelector(chapterNumbers);
    let chapters = await page.$$(chapterNumbers);
    chapters = chapters.slice(2);
    let chapterList = [];

    for (const chapter of chapters) {
      //let chapterLocation = 'tr > td'
      chapterList.push(chapter);
    }
    chapterList.reverse();

    store.updateLatestChapter(seriesName, chapterList.length-1);


    for (let i=0; i < chapterList.length-1; i++) {
      allChapters.push({name: seriesName, number: i});
    }
  } catch (e) {
    console.log("Error - scrapeAllChapters: "+e);
  }
  await browser.close();
  await queue.addChaptersIfNeeded(allChapters);
}

exports.__esModule = true;
exports.scrapeNewest = scrapeNewest;
exports.scrapeMyList = scrapeMyList;
exports.scrapeAllChapters = scrapeAllChapters;
