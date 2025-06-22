const express = require('express');
const router = express.Router();
const db = require('../models');
const processCatalog = require('../scripts/processCatalog');

router.post('/process-strain-catalog', async (req, res) => {
    try {
        // Check for an already running job
        const runningJob = await db.jobStatus.findOne({
            status: 'running',
            type: 'strain-catalog-processing'
        });

        if (runningJob) {
            return res.status(409).json({
                message: 'A strain catalog processing job is already running.',
                jobId: runningJob._id
            });
        }
        

        const job = new db.jobStatus({
            type: 'strain-catalog-processing',
            status: 'pending',
        });
        await job.save();

        // Launch the job in background
        processCatalog(job._id.toString());

        res.status(202).json({ jobId: job._id });
    } catch(error){
        res.status(500).json({ error: error.message });
    }
})
  
module.exports = router;
  