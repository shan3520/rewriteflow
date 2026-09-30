import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import HistoryTimeline from '../components/history/HistoryTimeline.jsx'
import { dayLabel } from '../lib/dates.js'

describe('HistoryTimeline', () => {
  const now = new Date(2026, 8, 30, 15, 0)
  const items = [
    { id: 'a', created_at: new Date(2026, 8, 30, 12).toISOString() },
    { id: 'b', created_at: new Date(2026, 8, 30, 9).toISOString() },
    { id: 'c', created_at: new Date(2026, 8, 29, 20).toISOString() },
    { id: 'd', created_at: new Date(2026, 5, 1, 8).toISOString() },
  ]

  it('groups consecutive items by day with running indexes', () => {
    render(<HistoryTimeline items={items} now={now} renderItem={(item, i) => <p>{item.id}{i}</p>} />)
    const sections = screen.getAllByRole('region')
    expect(sections.map(s => s.getAttribute('aria-label'))).toEqual(['Today', 'Yesterday', dayLabel(new Date(2026, 5, 1), now)])
    expect(sections[0].textContent).toContain('a0')
    expect(sections[0].textContent).toContain('b1')
    expect(sections[2].textContent).toContain('d3')
  })

  it('uses weekday names within the last week', () => {
    const label = dayLabel(new Date(2026, 8, 26), now)
    expect(label).toBe(new Date(2026, 8, 26).toLocaleDateString(undefined, { weekday: 'long' }))
  })
})
