const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.go = require('./GOBasic');
db.mgi = require('./MGIAnnotations');
db.strainCatalog = require('./MMRRCStrains');
db.jobStatus = require('./jobStatus');

module.exports = db;