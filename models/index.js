const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.GO = require('./GOBasic');
db.MGI = require('./MGIAnnotations');
db.strainCatalog = require('./MMRRCStrains');

module.exports = db;