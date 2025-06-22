const express = require('express');
const router = express.Router();
const db = require('../models');

router.get('/jobs/:jobId', async (req, res) => {
    try {
        const job = await db.jobStatus.findById(req.params.jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        res.status(200).json(job);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
  });
  
module.exports = router;
  