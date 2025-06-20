const mongoose = require('mongoose');

const JobStatusSchema = new mongoose.Schema({
    jobType: { type: String, default: 'strain-catalog-processing' },
    status: { type: String, enum: ['pending', 'running', 'completed', 'error'], default: 'pending' },
    total: { type: Number, default: 0 },
    processed: { type: Number, default: 0 },
    error: { type: String, default: null },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date }
  });
  
module.exports = mongoose.model('jobStatus', JobStatusSchema);