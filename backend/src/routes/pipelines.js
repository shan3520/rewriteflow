const express = require('express');
const router = express.Router();

const inMemoryPipelines = [
    { id: 'p1', name: 'Email Polish', nodes: ['GrammarFixNode', 'ToneShiftNode'] },
    { id: 'p2', name: 'Blog Summarizer', nodes: ['SummarizeNode', 'SEOOptimizerNode'] }
];

router.get('/', (req, res) => {
    res.json({ pipelines: inMemoryPipelines });
});

router.post('/', (req, res) => {
    const newPipeline = { id: `p${Date.now()}`, ...req.body };
    inMemoryPipelines.push(newPipeline);
    res.status(201).json(newPipeline);
});

module.exports = router;
