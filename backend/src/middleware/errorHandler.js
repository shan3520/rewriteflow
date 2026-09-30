export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

// app.onError handler: known HTTP errors keep their status and message,
// everything else is logged and reported as a generic 500.
export function errorHandler(err, c) {
  if (err instanceof HttpError) return c.json({ error: err.message }, err.status)
  console.error('Unhandled error:', err)
  return c.json({ error: 'Internal server error' }, 500)
}
