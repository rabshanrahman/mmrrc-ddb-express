const mongoose = require('mongoose');

const JobStatusSchema = new mongoose.Schema({
    jobType: { type: String },
    status: { type: String, enum: ['pending', 'running', 'completed', 'error'], default: 'pending' },
    total: { type: Number, default: 0 },
    processed: { type: Number, default: 0 },
    written: { type: Number, default: 0 },
    error: { type: String, default: null },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    workerErrors: [
        {
          strainId: mongoose.Schema.Types.ObjectId,
          message: String,
          detail: String,
        }
      ]
  }, {
    timestamps: true
  });
  
module.exports = mongoose.model('jobStatus', JobStatusSchema, 'job-status');