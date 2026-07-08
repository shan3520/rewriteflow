/**
 * Subprocess bridge to Python rewriteflow engine.
 */
const { spawn } = require('child_process');
const path = require('path');

function runEngineCommand(text, workflowConfig = {}) {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', ['-m', 'engine.cli', 'run', '--text', text], {
            cwd: path.resolve(__dirname, '../../../')
        });

        let stdout = '';
        let stderr = '';

        pythonProcess.stdout.on('data', (data) => { stdout += data.toString(); });
        pythonProcess.stderr.on('data', (data) => { stderr += data.toString(); });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(`Python process exited with code ${code}: ${stderr}`));
            }
            resolve({ outputText: stdout.trim(), success: true });
        });
    });
}

module.exports = { runEngineCommand };
