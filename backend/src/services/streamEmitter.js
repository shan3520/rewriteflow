// Wraps an async producer in an ndjson streaming Response. `send` returns
// false once the client has disconnected so the producer can stop early.
export function ndjsonResponse(signal, produce) {
  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder()
      let closed = false
      const close = () => {
        if (closed) return
        closed = true
        try { controller.close() } catch { /* already closed */ }
      }
      const send = (obj) => {
        if (closed || signal?.aborted) return false
        controller.enqueue(enc.encode(JSON.stringify(obj) + '\n'))
        return true
      }
      try {
        await produce(send)
      } catch (err) {
        if (err?.name !== 'AbortError') {
          console.error('Stream error:', err)
          send({ type: 'error', message: err.message || 'Unexpected error' })
        }
      } finally {
        close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache',
    },
  })
}
