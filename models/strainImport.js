const mongoose = require('mongoose');

const strainImportSchema = new mongoose.Schema({
    jobId: String,
    row: Number,
    strainStockId: String,
    mgiAlleleAccessionId: String,
    mgiGeneAccessionId: String
}, { timestamps: true });

module.exports = mongoose.model('strainImport', strainImportSchema, 'strain-import');