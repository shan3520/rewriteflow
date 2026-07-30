const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        services: {
            backend: 'OK',
            engine: 'OK'
        }
    });
});

module.exports = router;
