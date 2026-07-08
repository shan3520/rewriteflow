const request = require('supertest');
const express = require('express');
const pipelineRouter = require('../routes/pipelines');

const app = express();
app.use(express.json());
app.use('/api/v1/pipelines', pipelineRouter);

describe('Pipelines API', () => {
    it('GET /api/v1/pipelines should return pipeline array', async () => {
        const res = await request(app).get('/api/v1/pipelines');
        expect(res.statusCode).toEqual(200);
        expect(res.body.pipelines).toBeDefined();
        expect(res.body.pipelines.length).toBeGreaterThan(0);
    });
});
