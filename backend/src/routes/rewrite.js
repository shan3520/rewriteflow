const express = require('express');
const router = express.Router();
const { runEngineCommand } = require('../services/engineBridge');

router.post('/', async (req, res) => {
    try {
        const { text, pipeline } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Field "text" is required.' });
        }
        const result = await runEngineCommand(text, pipeline);
        res.json({ success: true, original: text, rewritten: result.outputText });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
