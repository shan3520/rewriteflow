const jobRepo = require('../db/repository');

describe('JobRepository', () => {
    it('should create and update jobs', async () => {
        const job = await jobRepo.createJob('j1', 'sample text');
        expect(job.status).toEqual('PENDING');
        const updated = await jobRepo.updateJobStatus('j1', 'SUCCESS', 'result text');
        expect(updated.status).toEqual('SUCCESS');
        expect(updated.rewrittenText).toEqual('result text');
    });
});
