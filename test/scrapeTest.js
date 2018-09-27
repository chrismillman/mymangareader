const assert = require('chai').assert;
const app = require('../scrape');

seriesList = ["One-Piece"];
foundImages = app.scrape(seriesList);

describe('scrape', () => {
  it ('get correct images', () => {
    assert.equal()
  });
});
