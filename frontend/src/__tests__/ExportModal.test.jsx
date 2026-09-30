import { describe, it, expect } from 'vitest'
import { buildExport, buildMarkdown, buildText, buildZip, safeFilename } from '../lib/exporters.js'

describe('exporters', () => {
  it('builds plain text with an optional original section', () => {
    expect(buildText({ rewritten: 'New.', original: 'Old.', includeOriginal: false })).toBe('New.\n')
    expect(buildText({ rewritten: 'New.', original: 'Old.', includeOriginal: true })).toContain('ORIGINAL\n\nOld.')
  })

  it('builds markdown with a title', () => {
    const md = buildMarkdown({ title: 'Notes', rewritten: 'New.', original: 'Old.', includeOriginal: true })
    expect(md.startsWith('# Notes\n\nNew.')).toBe(true)
    expect(md).toContain('## Original\n\nOld.')
  })

  it('sanitises file names', () => {
    expect(safeFilename('my report.md')).toBe('my-report')
    expect(safeFilename('../../etc')).toBe('etc')
    expect(safeFilename('')).toBe('rewrite')
  })

  it('creates a Word document', async () => {
    const { blob, filename } = await buildExport({ format: 'docx', filename: 'out', rewritten: 'One.\n\nTwo.' })
    expect(filename).toBe('out.docx')
    expect(blob.size).toBeGreaterThan(1000)
  })

  it('zips several files and de-duplicates names', async () => {
    const a = await buildExport({ format: 'txt', filename: 'same', rewritten: 'A' })
    const b = await buildExport({ format: 'txt', filename: 'same', rewritten: 'B' })
    const { blob, filename } = await buildZip([a, b], 'batch')
    expect(filename).toBe('batch.zip')
    const { default: JSZip } = await import('jszip')
    const zip = await JSZip.loadAsync(await blob.arrayBuffer())
    expect(Object.keys(zip.files).sort()).toEqual(['same-2.txt', 'same.txt'])
  })
})
