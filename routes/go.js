const express = require('express');
const router = express.Router();
const db = require('../models');

router.get('/go/:id', async (req, res) => {
    try {
        const term = await db.go.findOne({
            id: req.params.id
        })
        if (!term) return res.status(404).json({ message: 'GO ID/URL not found' });

        res.status(200).json(term);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
  });

// Get children of a GO term
router.get('/go/children/:id', async (req, res) => {
    try {
        const children = await db.goEdges.find({
            obj: req.params.id
        });
        if (!children) return res.status(404).json({ message: 'GO ID not found' });

        res.status(200).json(children);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
  });
  
module.exports = router;