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

router.post('/go/batch', async (req, res) => {
    try {
        const { ids } = req.body;
        
        // Validate input
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'ids must be a non-empty array' });
        }
        
        // Limit batch size to prevent abuse
        if (ids.length > 100) {
            return res.status(400).json({ error: 'Maximum 100 IDs per batch' });
        }
        
        // Find all terms with IDs in the array
        const terms = await db.go.find({
            id: { $in: ids }
        });
        
        // Create a map for quick lookup
        const termMap = {};
        terms.forEach(term => {
            termMap[term.id] = term;
        });
        
        // Return results in the same order as requested, with null for missing terms
        const results = ids.map(id => termMap[id] || null);
        
        res.status(200).json(results);
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