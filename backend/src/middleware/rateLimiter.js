const requests = new Map();

function rateLimiter(req, res, next) {
    const ip = req.ip || '127.0.0.1';
    const current = requests.get(ip) || { count: 0, reset: Date.now() + 60000 };
    if (Date.now() > current.reset) {
        current.count = 0;
        current.reset = Date.now() + 60000;
    }
    current.count += 1;
    requests.set(ip, current);

    res.setHeader('X-RateLimit-Limit', 60);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, 60 - current.count));
    if (current.count > 60) {
        return res.status(429).json({ error: 'Too many requests. Rate limit exceeded.' });
    }
    next();
}
module.exports = rateLimiter;
