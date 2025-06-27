const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.go = require('./goBasic');
db.mgi = require('./mgiAnnotations');
db.strainCatalog = require('./mmrrcStrains');
db.jobStatus = require('./jobStatus');
db.strainImport = require('./strainImport');
db.goEdges = require('./goEdge');

module.exports = db;