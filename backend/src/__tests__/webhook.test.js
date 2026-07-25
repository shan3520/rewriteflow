const WebhookService = require('../services/webhookService');

describe('WebhookService', () => {
    it('generates valid HMAC signature', () => {
        const sig = WebhookService.generateSignature({ test: 123 }, 'secret');
        expect(sig).toBeDefined();
        expect(sig.length).toEqual(64);
    });
});
