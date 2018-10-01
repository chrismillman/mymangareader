// Gets the user_id and builds the view of images to send to
//   the client
const scraper = require('../scraper/scrape');
const store = require('../storage/store');
const queue = require('../queue/job-queue');

async function buildView (user_id, cb) {
  let value = await store.userExists(user_id);
  if (value === true){
    // Get user's list of series from database
    let list = await store.downloadUser(user_id);
    let chapters = await store.downloadChapters(list);
    cb(chapters);
  } else if (value === false) {
    store.uploadUser({name: user_id, series: []});
  }
}

async function removeChapter (user_id, series, cb) {
  let value = await store.userExists(user_id);
  if (value === true){
    // Get user's list of series from database
    let list = await store.downloadUser(user_id);
    let updatedList = [];
    for (const obj of list) {
      if (obj.name !== series) {
        updatedList.push(obj);
      }
    }
    store.uploadUser({name: user_id, series: updatedList});
    cb();
  } else if (value === false) {
    store.uploadUser({name: user_id, series: []});
  }
}

async function previousChapter (user_id, series, cb) {
  let value = await store.userExists(user_id);
  if (value === true){
    // Get user's list of series from database
    let list = await store.downloadUser(user_id);
    let chapter = null;
    // Update user's chapter

    for (const obj of list) {
      if (obj.name === series && obj.number > 0) {
        if (await store.seriesExists({name: obj.name, number: obj.number-1})) {
          obj.number--;
          chapter = [obj];
        } else {
          obj.number--;
          chapter = [obj];
          await queue.addChaptersIfNeeded(chapter);
          if (obj.images) {
            await delete obj.images;
          }
        }
      } else if (obj.name === series) {
        chapter = [obj];
      }
    }
    await store.uploadUser({name: user_id, series: list});
    let images = await store.downloadChapters(chapter);
    await cb(images);
  } else if (value === false) {
    store.uploadUser({name: user_id, series: []});
  }
}

async function nextChapter (user_id, series, cb) {
  let value = await store.userExists(user_id);
  if (value === true){
    // Get user's list of series from database
    let list = await store.downloadUser(user_id);
    let chapter = null;
    let latestChapter = await store.seriesLatest(series)
    // Update user's chapter
    for (const obj of list) {
      if (obj.name === series && obj.number < latestChapter) {
        if (await store.seriesExists({name: obj.name, number: obj.number+1})) {
          obj.number++;
          chapter = [obj];
        } else {
          obj.number++;
          chapter = [obj];
          await queue.addChaptersIfNeeded(chapter);
          if (obj.images) {
            await delete obj.images;
          }
        }
      } else if (obj.name === series) {
        chapter = [obj];
      }
    }
    await store.uploadUser({name: user_id, series: list});
    let images = await store.downloadChapters(chapter);
    await cb(images);
  } else if (value === false) {
    store.uploadUser({name: user_id, series: []});
  }
}

exports.__esModule = true;
exports.buildView = buildView;
exports.removeChapter = removeChapter;
exports.previousChapter = previousChapter;
exports.nextChapter = nextChapter;
