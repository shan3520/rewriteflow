const crypto = require('crypto');

class WebhookService {
    static generateSignature(payload, secret) {
        return crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
    }
    static async dispatchWebhook(url, payload, secret) {
        const sig = WebhookService.generateSignature(payload, secret);
        console.log(`Dispatched webhook to ${url} with signature ${sig}`);
        return { success: true };
    }
}
module.exports = WebhookService;
