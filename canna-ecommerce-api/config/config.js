const path = require('path');
const environment = require('./environment');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');

const config = Object.freeze({
  ...environment,
  rootDir: ROOT,
  dataPath: DATA_DIR,
  productsFile: path.join(DATA_DIR, 'products.json'),
  cartsFile: path.join(DATA_DIR, 'carts.json'),
  validCategories: ['flowers', 'extracts', 'edibles', 'accessories'],
  pagination: { defaultLimit: 10, maxLimit: 50 }
});

module.exports = config;
