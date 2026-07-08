/**
 * Subprocess bridge to Python engine with timeout guard.
 */
const { spawn } = require('child_process');
const path = require('path');

function runEngineCommand(text, workflowConfig = {}, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', ['-m', 'engine.cli', 'run', '--text', text], {
            cwd: path.resolve(__dirname, '../../../')
        });

        let stdout = '';
        let stderr = '';

        const timer = setTimeout(() => {
            pythonProcess.kill();
            reject(new Error(`Execution timed out after ${timeoutMs}ms`));
        }, timeoutMs);

        pythonProcess.stdout.on('data', (data) => { stdout += data.toString(); });
        pythonProcess.stderr.on('data', (data) => { stderr += data.toString(); });

        pythonProcess.on('close', (code) => {
            clearTimeout(timer);
            if (code !== 0) {
                return reject(new Error(`Python process exited with code ${code}: ${stderr}`));
            }
            resolve({ outputText: stdout.trim(), success: true });
        });
    });
}

module.exports = { runEngineCommand };
