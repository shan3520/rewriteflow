const express = require('express');
const router = express.Router();
const WebhookService = require('../services/webhookService');

router.post('/test', async (req, res) => {
    const result = await WebhookService.dispatchWebhook('http://example.com/callback', req.body, 'secret_key');
    res.json(result);
});

module.exports = router;
