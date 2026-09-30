import { buildModePrompt, buildWorkflowPrompt } from '../lib/prompts.js'
import { HttpError } from '../middleware/errorHandler.js'

// Turns a validated rewrite request into the system prompt to send and the
// labels to store with the history entry.
export async function resolveInstructions({ library, repo, userId, request }) {
  if (request.mode) {
    return { system: buildModePrompt(library, request.mode, request.options), mode: request.mode, workflowName: null }
  }

  let workflow = request.workflow
  if (request.workflowId) {
    workflow = request.workflowId.startsWith('starter:')
      ? library.starters.find(s => s.id === request.workflowId)
      : await repo.getWorkflow(userId, request.workflowId)
    if (!workflow) throw new HttpError(404, 'Workflow not found')
  }

  return {
    system: buildWorkflowPrompt(library, workflow, request.options),
    mode: 'workflow',
    workflowName: workflow.name,
  }
}
