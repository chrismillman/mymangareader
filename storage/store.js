const Datastore = require('@google-cloud/datastore');
const projectId = 'my-manga-reader-1';

// Create client
const datastore = new Datastore({
  projectId: projectId,
});

// USER FUNCTIONALITY
async function userExists (user_id) {
  let value = null;
  const taskKey = datastore.key(["users", user_id]);
  let entity = await datastore.get(taskKey).then((results) => {
    if (results[0] !== undefined) {
      //console.log(`user_id: ${user_id} Already Exists`);
      value = true;
    } else{
      //console.log(`user_id: ${user_id} Doesn't Exist`);
      value = true;
    }
  });
  return value;
}
async function uploadUser (obj) {
  const taskKey = datastore.key(["users", obj.name]);
  if (obj.series.length > 1) {
    obj.series.sort((a, b) => {
      return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);
    });
  }

  const entity = {
    key: taskKey,
    data: {
      series: obj.series,
    },
  };

  // Saves the entity
  datastore
    .save(entity)
    .then(() => {
      //console.log(`Saved user: ${obj.name}`);
    })
    .catch(err => {
      console.error('Error - uploadUser:', err);
    });
}
async function downloadUser (user_id) {
  const taskKey = datastore.key(["users", user_id]);
  let entity = null;

  // Gets the entity
  await datastore
    .get(taskKey)
    .then((results) => {
      //console.log(`Received user: ${user_id}`);
      entity = results[0];
    })
    .catch(err => {
      console.error('Error - downloadUser:', err);
    });
  return entity.series;
}


// SERIES FUNCTIONALITY
async function seriesExists (obj) {
  let value = null;
  const taskKey = datastore.key(["series", obj.name, obj.number, "images"]);
  let entity = await datastore.get(taskKey).then((results) => {
    if (results[0] !== undefined) {
      //console.log(`${obj.name}: ${obj.number} Already Uploaded`);
      value = true;
    } else{
      //console.log(`${obj.name}: ${obj.number} Not Uploaded`);
      value = false;
    }
  });
  return value;
}
function uploadChapter (obj) {
  const taskKey = datastore.key(["series", obj.name, obj.number, "images"]);

  // Prepares the new entity
  const entity = {
    key: taskKey,
    data: {
      links: obj.images,
    },
  };

  // Saves the entity
  datastore
    .save(entity)
    .then(() => {
      console.log(`Saved ${obj.name}: ${obj.number}`);
    })
    .catch(err => {
      console.error('Error - addChaptersIfNeeded:', err);
    });
}
async function seriesLatest (series) {
  let value = null;
  const taskKey = datastore.key(["seriesIndex", series]);
  let entity = await datastore.get(taskKey).then((results) => {
    if (results[0] !== undefined) {
      //console.log(`user_id: ${user_id} Already Exists`);
      value = results[0].latestChapter;
    }
  });
  return value;
}
async function updateLatestChapter (series, latest) {
  const taskKey = datastore.key(["seriesIndex", series]);

  const entity = {
    key: taskKey,
    data: {
      latestChapter: latest,
    },
  };

  // Saves the entity
  datastore
    .save(entity)
    .then(() => {
      //console.log(`Saved user: ${obj.name}`);
    })
    .catch(err => {
      console.error('Error - updateLatestChapter:', err);
    });
}
async function downloadChapters (list) {
  let retrievedList = [];
  for (const obj of list){
    const taskKey = datastore.key(["series", obj.name, obj.number, "images"]);

    // Gets the entity
    await datastore
      .get(taskKey)
      .then((results) => {
        //console.log(`Received ${obj.name}: ${obj.number}`);
        let entity = results[0];
        obj.images = entity.links;
        retrievedList.push(obj);
      })
      .catch(err => {
        console.error('Error - downloadChapters: ', err);
      });
  }
  return retrievedList;
}


// INDEX FUNCTIONALITY
async function downloadSeriesIndex (seriesName) {
  console.log("downloading index...");
  const taskKey = datastore.key(["seriesIndex", 'default']);
  let entity = null;

  const query = datastore
    .createQuery('seriesIndex').select('name');

  // Gets the entity
  /*
  await datastore
    .get(taskKey)
    .then((results) => {
      entity = results[0];
      console.log(`Received: ${entity}`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
    */
  await datastore.runQuery(query).then(results => {
    const entity = results[0];
    console.log('Tasks:');
    entity.forEach(task => console.log(JSON.stringify(task)));
  });
  return entity;
}


exports.__esModule = true;
exports.userExists = userExists;
exports.uploadUser = uploadUser;
exports.downloadUser = downloadUser;
exports.seriesExists = seriesExists;
exports.seriesLatest = seriesLatest;
exports.uploadChapter = uploadChapter;
exports.updateLatestChapter = updateLatestChapter;
exports.downloadChapters = downloadChapters;
exports.downloadSeriesIndex = downloadSeriesIndex;
