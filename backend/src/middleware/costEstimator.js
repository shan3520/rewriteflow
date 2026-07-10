function estimateTokensAndCost(req, res, next) {
    const text = req.body.text || '';
    const approxTokens = Math.ceil(text.length / 4);
    const estimatedCostUsd = (approxTokens / 1000) * 0.002;
    req.tokenStats = { approxTokens, estimatedCostUsd };
    res.setHeader('X-Estimated-Tokens', approxTokens);
    res.setHeader('X-Estimated-Cost-USD', estimatedCostUsd.toFixed(6));
    next();
}
module.exports = estimateTokensAndCost;
