const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

function processStreamLine(line, onProgress, onParagraph) {
  if (!line.trim()) return null

  const data = JSON.parse(line)
  if (data.type === 'progress' && onProgress) {
    onProgress(data.current, data.total)
  } else if (data.type === 'paragraph' && onParagraph) {
    onParagraph(data.text)
  } else if (data.type === 'result') {
    return data
  } else if (data.type === 'error') {
    throw new Error(data.message)
  }

  return null
}

async function getAuthHeader(session) {
  return {
    Authorization: `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  }
}

// Run a fetch, turning a dropped/blocked connection into a readable message.
async function apiFetch(url, options) {
  try {
    return await fetch(url, options)
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new Error('Could not reach the server. Check your connection and try again.', { cause: err })
  }
}

// Build an Error from a non-OK response, preferring the server's message
// and falling back to a status-appropriate one.
async function describeError(response) {
  const error = await describeErrorMessage(response)
  error.status = response.status
  const retryAfter = Number(response.headers?.get?.('Retry-After'))
  if (retryAfter > 0) error.retryAfter = retryAfter
  return error
}

async function describeErrorMessage(response) {
  let serverMessage = ''
  try {
    const data = await response.json()
    serverMessage = data?.error || data?.message || ''
  } catch {
    // no JSON body
  }
  if (response.status === 401 || response.status === 403) {
    return new Error(serverMessage || 'Your session has expired. Please sign in again.')
  }
  if (response.status === 404) {
    return new Error(serverMessage || 'That item could no longer be found.')
  }
  if (response.status === 429) {
    return new Error(serverMessage || 'Too many requests. Wait a moment, then try again.')
  }
  if (response.status >= 500) {
    return new Error(serverMessage || 'The server ran into a problem. Please try again.')
  }
  return new Error(serverMessage || `Request failed (${response.status}).`)
}

/**
 * Rewrite `text` using exactly one instruction source:
 *   { mode } | { workflowId } | { steps, custom_instruction }
 * plus optional `options` ({ length, formality }). Streams ndjson and calls
 * onProgress(current, total) / onParagraph(text) as paragraphs finish.
 */
export async function rewriteText(session, request, { onProgress, onParagraph, signal } = {}) {
  const headers = await getAuthHeader(session)
  const response = await apiFetch(`${API_BASE}/api/rewrite`, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
    signal,
  })

  if (!response.ok) {
    throw await describeError(response)
  }

  if (!response.body) {
    throw new Error("We couldn't start the rewrite. Please try again.")
  }

  // Stream processing: ndjson chunks
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let result = null

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      buffer += decoder.decode()
      break
    }

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const parsed = processStreamLine(line, onProgress, onParagraph)
      if (parsed) result = parsed
    }
  }

  if (buffer.trim()) {
    const parsed = processStreamLine(buffer, onProgress, onParagraph)
    if (parsed) result = parsed
  }

  if (!result) {
    throw new Error("The rewrite was cut off before it finished. Please try again.")
  }

  return result
}

export async function getHistory(session) {
  const headers = await getAuthHeader(session)
  const response = await apiFetch(`${API_BASE}/api/history`, { headers })
  if (!response.ok) throw await describeError(response)
  return response.json()
}

export async function deleteHistoryItem(session, id) {
  const headers = await getAuthHeader(session)
  const response = await apiFetch(`${API_BASE}/api/history/${id}`, {
    method: 'DELETE',
    headers,
  })
  if (!response.ok) throw await describeError(response)
  return response.json()
}

async function json(response) {
  if (!response.ok) throw await describeError(response)
  return response.json()
}

// Step library, mode labels and option choices. Public.
export async function getSteps() {
  return json(await apiFetch(`${API_BASE}/api/steps`))
}

// Built-in starter workflows (presets/*.yaml). Public.
export async function getStarterWorkflows() {
  return (await json(await apiFetch(`${API_BASE}/api/workflows/starters`))).workflows
}

export async function listWorkflows(session) {
  const headers = await getAuthHeader(session)
  return (await json(await apiFetch(`${API_BASE}/api/workflows`, { headers }))).workflows
}

export async function createWorkflow(session, workflow) {
  const headers = await getAuthHeader(session)
  return (await json(await apiFetch(`${API_BASE}/api/workflows`, {
    method: 'POST',
    headers,
    body: JSON.stringify(workflow),
  }))).workflow
}

export async function updateWorkflow(session, id, workflow) {
  const headers = await getAuthHeader(session)
  return (await json(await apiFetch(`${API_BASE}/api/workflows/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(workflow),
  }))).workflow
}

export async function deleteWorkflow(session, id) {
  const headers = await getAuthHeader(session)
  return json(await apiFetch(`${API_BASE}/api/workflows/${id}`, { method: 'DELETE', headers }))
}
