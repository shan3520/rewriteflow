/**
 * Subprocess bridge to Python engine with retry resilience.
 */
const { spawn } = require('child_process');
const path = require('path');

async function runWithRetry(fn, retries = 3, delay = 500) {
    try {
        return await fn();
    } catch (err) {
        if (retries <= 1) throw err;
        await new Promise(r => setTimeout(r, delay));
        return runWithRetry(fn, retries - 1, delay * 2);
    }
}

module.exports = { runWithRetry };
