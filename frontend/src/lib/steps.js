export const MAX_STEPS = 10

let nextKey = 0
// Stable React keys for workflow steps, so reordering moves the same DOM node
// (and keeps keyboard focus on the button that was pressed).
export function withKeys(steps) {
  return steps.map(s => (s._key ? s : { ...s, _key: `step-${nextKey++}` }))
}

export function withoutKeys(steps) {
  return steps.map(({ _key, ...s }) => s) // eslint-disable-line no-unused-vars
}

export function moveItem(list, from, to) {
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}
