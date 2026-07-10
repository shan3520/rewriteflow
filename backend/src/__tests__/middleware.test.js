const estimateTokensAndCost = require('../middleware/costEstimator');

describe('Middleware Tests', () => {
    it('should calculate estimated tokens correctly', () => {
        const req = { body: { text: 'Hello World! Sample text.' } };
        const res = { setHeader: jest.fn() };
        const next = jest.fn();
        estimateTokensAndCost(req, res, next);
        expect(req.tokenStats.approxTokens).toBeGreaterThan(0);
        expect(next).toHaveBeenCalled();
    });
});
