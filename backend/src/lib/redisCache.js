class MockRedisCache {
    constructor() {
        this.store = new Map();
    }
    async get(key) {
        return this.store.get(key) || null;
    }
    async set(key, value, ttlSeconds = 3600) {
        this.store.set(key, value);
    }
}
module.exports = new MockRedisCache();
