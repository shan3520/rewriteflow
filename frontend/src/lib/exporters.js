// Builds downloadable files for a rewrite. docx and jszip are imported lazily
// so they only load when someone actually exports.

export const FORMATS = [
  { value: 'txt', label: 'Plain text', ext: 'txt', mime: 'text/plain;charset=utf-8' },
  { value: 'md', label: 'Markdown', ext: 'md', mime: 'text/markdown;charset=utf-8' },
  { value: 'docx', label: 'Word', ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
]

const paragraphs = (text) => text.split(/\n\n+/).map(p => p.trim()).filter(Boolean)

export function safeFilename(name, fallback = 'rewrite') {
  const cleaned = (name || '').replace(/\.[a-z0-9]+$/i, '').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-')
  return cleaned || fallback
}

export function buildText({ rewritten, original, includeOriginal }) {
  if (!includeOriginal) return `${rewritten.trim()}\n`
  return `REWRITE\n\n${rewritten.trim()}\n\n----------\n\nORIGINAL\n\n${original.trim()}\n`
}

export function buildMarkdown({ title, rewritten, original, includeOriginal }) {
  const parts = [`# ${title}`, '', rewritten.trim(), '']
  if (includeOriginal) parts.push('---', '', '## Original', '', original.trim(), '')
  return parts.join('\n')
}

async function buildDocx({ title, rewritten, original, includeOriginal }) {
  const { Document, HeadingLevel, Packer, Paragraph } = await import('docx')
  const body = (text) => paragraphs(text).map(p => new Paragraph({ text: p, spacing: { after: 200 } }))
  const children = [new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }), ...body(rewritten)]
  if (includeOriginal) {
    children.push(new Paragraph({ text: 'Original', heading: HeadingLevel.HEADING_2, pageBreakBefore: true }), ...body(original))
  }
  return Packer.toBlob(new Document({ creator: 'RewriteFlow', title, sections: [{ children }] }))
}

/** Returns { blob, filename } for one rewrite in the chosen format. */
export async function buildExport({ format, filename, title = 'Rewrite', rewritten, original = '', includeOriginal = false }) {
  const def = FORMATS.find(f => f.value === format) ?? FORMATS[0]
  const name = `${safeFilename(filename)}.${def.ext}`
  if (def.value === 'docx') {
    return { blob: await buildDocx({ title, rewritten, original, includeOriginal }), filename: name }
  }
  const text = def.value === 'md'
    ? buildMarkdown({ title, rewritten, original, includeOriginal })
    : buildText({ rewritten, original, includeOriginal })
  return { blob: new Blob([text], { type: def.mime }), filename: name }
}

/** Zips several { filename, blob } entries into one download. */
export async function buildZip(files, zipName = 'rewrites') {
  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()
  const used = new Set()
  for (const { filename, blob } of files) {
    let name = filename
    for (let n = 2; used.has(name); n++) name = filename.replace(/(\.[^.]+)$/, `-${n}$1`)
    used.add(name)
    zip.file(name, blob)
  }
  return { blob: await zip.generateAsync({ type: 'blob' }), filename: `${safeFilename(zipName, 'rewrites')}.zip` }
}

export function downloadBlob({ blob, filename }) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
