import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BatchDashboard from '../components/batch/BatchDashboard.jsx'
import { readTextFiles } from '../lib/files.js'

const jobs = [
  { id: '1', name: 'a.txt', words: 10, status: 'done', output: 'x', issues: 2 },
  { id: '2', name: 'b.md', words: 5, status: 'running' },
  { id: '3', name: 'c.txt', words: 3, status: 'error', error: 'Rate limit' },
]

describe('BatchDashboard', () => {
  it('summarises job states and shows per-file details', () => {
    render(<BatchDashboard jobs={jobs} running progress={{ current: 1, total: 4 }} format="txt" onFormatChange={vi.fn()} onView={vi.fn()} onDownload={vi.fn()} onRemove={vi.fn()} onDownloadAll={vi.fn()} />)
    expect(screen.getByRole('heading').textContent).toBe('3 files · 1 done · 1 failed')
    expect(screen.getByText('2 details to check')).toBeTruthy()
    expect(screen.getByText('Paragraph 1 of 4')).toBeTruthy()
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('25')
    expect(screen.getByText('Rate limit')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Download all/ }).disabled).toBe(true)
  })

  it('offers view and download for finished files', () => {
    const onView = vi.fn()
    render(<BatchDashboard jobs={jobs} running={false} progress={null} format="txt" onFormatChange={vi.fn()} onView={onView} onDownload={vi.fn()} onRemove={vi.fn()} onDownloadAll={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'View changes in a.txt' }))
    expect(onView).toHaveBeenCalledWith(jobs[0])
  })
})

describe('readTextFiles', () => {
  it('accepts .txt/.md and reports unsupported, empty and oversized files', async () => {
    const files = [
      new File(['hello\r\nworld'], 'ok.txt'),
      new File(['# Title'], 'notes.md'),
      new File(['x'], 'image.png'),
      new File(['   '], 'empty.txt'),
      new File(['x'.repeat(20)], 'big.txt'),
    ]
    const { files: ok, errors } = await readTextFiles(files, 15)
    expect(ok).toEqual([{ name: 'ok.txt', text: 'hello\nworld' }, { name: 'notes.md', text: '# Title' }])
    expect(errors).toHaveLength(3)
  })
})
