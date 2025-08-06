const express = require('express');
const router = express.Router();
const db = require('../models');
const { Op } = require('sequelize');

// Get a single GO term by ID
router.get('/go/:id', async (req, res) => {
    try {
        const term = await db.goTerms.findOne({
            where: {
                go_id: req.params.id
            }
        });
        
        if (!term) {
            return res.status(404).json({ message: 'GO ID not found' });
        }

        res.status(200).json(term);
    } catch (err) {
        console.error('Error fetching GO term:', err);
        res.status(500).json({ error: err.message });
    }
});

// Batch fetch GO terms
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
        const terms = await db.goTerms.findAll({
            where: {
                go_id: {
                    [Op.in]: ids
                }
            }
        });
        
        // Create a map for quick lookup
        const termMap = {};
        terms.forEach(term => {
            termMap[term.go_id] = term;
        });
        
        // Return results in the same order as requested, with null for missing terms
        const results = ids.map(id => termMap[id] || null);
        
        res.status(200).json(results);
    } catch (err) {
        console.error('Error in batch GO fetch:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get children of a GO term
router.get('/go/children/:id', async (req, res) => {
    try {
        const children = await db.goTermRelationships.findAll({
            where: {
                parent_go_id: req.params.id
            },
            include: [{
                model: db.goTerms,
                as: 'childTerm',
                foreignKey: 'child_go_id',
                targetKey: 'go_id'
            }]
        });
        
        if (!children || children.length === 0) {
            return res.status(404).json({ message: 'No children found for this GO ID' });
        }

        res.status(200).json(children);
    } catch (err) {
        console.error('Error fetching GO children:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get parents of a GO term
router.get('/go/parents/:id', async (req, res) => {
    try {
        const parents = await db.goTermRelationships.findAll({
            where: {
                child_go_id: req.params.id
            },
            include: [{
                model: db.goTerms,
                as: 'parentTerm',
                foreignKey: 'parent_go_id',
                targetKey: 'go_id'
            }]
        });
        
        if (!parents || parents.length === 0) {
            return res.status(404).json({ message: 'No parents found for this GO ID' });
        }

        res.status(200).json(parents);
    } catch (err) {
        console.error('Error fetching GO parents:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get MMRRC strains associated with a GO term
router.get('/go/:id/mmrrc-strains', async (req, res) => {
    try {
        const mappings = await db.mmrrcGoMapping.findAll({
            where: {
                go_id: req.params.id
            }
        });
        
        if (!mappings || mappings.length === 0) {
            return res.status(404).json({ message: 'No MMRRC strains found for this GO ID' });
        }

        const mmrrcIds = mappings.map(mapping => mapping.mmrrc_id);
        
        const strains = await db.searchCatalog.findAll({
            where: {
                mmrrc_id: {
                    [Op.in]: mmrrcIds
                }
            }
        });

        res.status(200).json(strains);
    } catch (err) {
        console.error('Error fetching MMRRC strains for GO term:', err);
        res.status(500).json({ error: err.message });
    }
});

// Search GO terms by name or definition
router.get('/go/search/:query', async (req, res) => {
    try {
        const query = req.params.query;
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        
        if (limit > 100) {
            return res.status(400).json({ error: 'Maximum limit is 100' });
        }
        
        const terms = await db.goTerms.findAll({
            where: {
                [Op.or]: [
                    {
                        name: {
                            [Op.like]: `%${query}%`
                        }
                    },
                    {
                        definition: {
                            [Op.like]: `%${query}%`
                        }
                    },
                    {
                        go_id: {
                            [Op.like]: `%${query}%`
                        }
                    }
                ]
            },
            limit: limit,
            offset: offset,
            order: [['name', 'ASC']]
        });

        res.status(200).json(terms);
    } catch (err) {
        console.error('Error searching GO terms:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;