class JobRepository {
    constructor() {
        this.jobs = new Map();
    }
    async createJob(id, originalText) {
        const job = { id, originalText, rewrittenText: null, status: 'PENDING', createdAt: new Date() };
        this.jobs.set(id, job);
        return job;
    }
    async updateJobStatus(id, status, rewrittenText = null) {
        const job = this.jobs.get(id);
        if (job) {
            job.status = status;
            if (rewrittenText) job.rewrittenText = rewrittenText;
        }
        return job;
    }
}
module.exports = new JobRepository();
