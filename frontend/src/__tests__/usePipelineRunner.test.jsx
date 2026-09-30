import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

vi.mock('../context/AuthContext.jsx', () => ({ useAuth: () => ({ session: { access_token: 't' } }) }))

const { usePipelineRunner } = await import('../hooks/usePipelineRunner.js')

function ndjsonResponse(lines) {
  const body = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder()
      // Split one line across chunks to exercise the buffering.
      const text = lines.map(l => JSON.stringify(l)).join('\n') + '\n'
      controller.enqueue(enc.encode(text.slice(0, 10)))
      controller.enqueue(enc.encode(text.slice(10)))
      controller.close()
    },
  })
  return new Response(body, { status: 200, headers: { 'Content-Type': 'application/x-ndjson' } })
}

afterEach(() => vi.unstubAllGlobals())

describe('usePipelineRunner', () => {
  it('streams paragraphs, then settles on the final result', async () => {
    const fetchMock = vi.fn(async () => ndjsonResponse([
      { type: 'progress', current: 1, total: 2 },
      { type: 'paragraph', text: 'One.' },
      { type: 'progress', current: 2, total: 2 },
      { type: 'paragraph', text: 'Two.' },
      { type: 'result', rewritten_text: 'One.\n\nTwo.' },
    ]))
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => usePipelineRunner())

    let final
    await act(async () => { final = await result.current.run({ text: 'a\n\nb', mode: 'standard' }) })

    expect(final.rewritten_text).toBe('One.\n\nTwo.')
    expect(result.current.status).toBe('done')
    expect(result.current.output).toBe('One.\n\nTwo.')
    expect(result.current.source).toBe('a\n\nb')
    expect(result.current.progress).toEqual({ current: 2, total: 2 })
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ text: 'a\n\nb', mode: 'standard' })
  })

  it('surfaces stream errors and HTTP errors with status', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ndjsonResponse([{ type: 'error', message: 'Failed on paragraph 1: boom' }])))
    const { result } = renderHook(() => usePipelineRunner())
    await act(async () => {
      await expect(result.current.run({ text: 'x' })).rejects.toThrow('boom')
    })
    expect(result.current.status).toBe('error')

    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: 'Slow down' }), { status: 429, headers: { 'Retry-After': '12' } })))
    await act(async () => {
      const err = await result.current.run({ text: 'x' }).catch(e => e)
      expect(err.message).toBe('Slow down')
      expect(err.status).toBe(429)
      expect(err.retryAfter).toBe(12)
    })
  })

  it('returns null when cancelled', async () => {
    const abortError = () => Object.assign(new Error('aborted'), { name: 'AbortError' })
    vi.stubGlobal('fetch', vi.fn((url, { signal }) => new Promise((_, reject) => {
      if (signal.aborted) reject(abortError())
      signal.addEventListener('abort', () => reject(abortError()))
    })))
    const { result } = renderHook(() => usePipelineRunner())
    let pending
    act(() => { pending = result.current.run({ text: 'x' }) })
    act(() => result.current.cancel())
    await act(async () => { expect(await pending).toBeNull() })
    expect(result.current.status).toBe('cancelled')
  })
})
