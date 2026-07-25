const crypto = require('crypto');

class WebhookService {
    static generateSignature(payload, secret) {
        return crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
    }
    static verifySignature(payload, signature, secret) {
        const expected = WebhookService.generateSignature(payload, secret);
        const a = Buffer.from(expected, 'hex');
        const b = Buffer.from(signature, 'hex');
        if (a.length !== b.length) return false;
        return crypto.timingSafeEqual(a, b);
    }
}
module.exports = WebhookService;
