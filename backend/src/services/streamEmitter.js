const EventEmitter = require('events');
class PipelineStreamEmitter extends EventEmitter {
    emitStepStart(stepName) {
        this.emit('step_start', { stepName, timestamp: Date.now() });
    }
    emitStepComplete(stepName, outputText) {
        this.emit('step_complete', { stepName, outputText, timestamp: Date.now() });
    }
}
module.exports = PipelineStreamEmitter;
