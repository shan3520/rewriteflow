# Security & Rate Limiting Guidelines

- **Rate Limiter**: 60 requests per minute per IP.
- **Toxicity Filter**: Scans input payloads for restricted patterns.
- **Token Cost Estimator**: Exposes `X-Estimated-Tokens` and `X-Estimated-Cost-USD` response headers.
