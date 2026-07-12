const express = require('express');
const router = express.Router();
const jobRepo = require('../db/repository');

router.post('/jobs', async (req, res) => {
    const jobId = `job_${Date.now()}`;
    const job = await jobRepo.createJob(jobId, req.body.text || '');
    res.status(201).json(job);
});

module.exports = router;
