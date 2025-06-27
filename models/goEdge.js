const mongoose = require('mongoose');

const goEdgeSchema = new mongoose.Schema({
    sub: String,
    pred: String,
    obj: String, 
}, { strict: false });

module.exports = mongoose.model('goEdge', goEdgeSchema, 'go-edges');