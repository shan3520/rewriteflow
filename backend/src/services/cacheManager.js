const crypto = require('crypto');
const redisCache = require('../lib/redisCache');

class CacheManager {
    static generateHash(text, nodeType) {
        return crypto.createHash('md5').update(`${text}:${nodeType}`).digest('hex');
    }
    static async getCachedOutput(text, nodeType) {
        const hash = CacheManager.generateHash(text, nodeType);
        return await redisCache.get(hash);
    }
    static async setCachedOutput(text, nodeType, output) {
        const hash = CacheManager.generateHash(text, nodeType);
        await redisCache.set(hash, output);
    }
}
module.exports = CacheManager;
