const FORBIDDEN_WORDS = ['malware_payload', 'bypass_security', 'exploit_script'];

function toxicityFilter(req, res, next) {
    const text = JSON.stringify(req.body);
    for (const word of FORBIDDEN_WORDS) {
        if (text.includes(word)) {
            return res.status(400).json({ error: `Flagged unsafe content word: ${word}` });
        }
    }
    next();
}
module.exports = toxicityFilter;
