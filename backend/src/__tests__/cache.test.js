const CacheManager = require('../services/cacheManager');

describe('CacheManager', () => {
    it('should store and retrieve cached outputs', async () => {
        await CacheManager.setCachedOutput('hello', 'Grammar', 'Hello.');
        const cached = await CacheManager.getCachedOutput('hello', 'Grammar');
        expect(cached).toEqual('Hello.');
    });
});
