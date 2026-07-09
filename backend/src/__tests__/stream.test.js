const PipelineStreamEmitter = require('../services/streamEmitter');

describe('PipelineStreamEmitter', () => {
    it('should emit step events correctly', (done) => {
        const emitter = new PipelineStreamEmitter();
        emitter.on('step_start', (data) => {
            expect(data.stepName).toEqual('GrammarFixNode');
            done();
        });
        emitter.emitStepStart('GrammarFixNode');
    });
});
