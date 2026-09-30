export const ACCEPT = ['.txt', '.md', '.markdown']

// Reads uploaded files as text, skipping unsupported, empty or oversized ones.
export async function readTextFiles(fileList, maxChars) {
  const files = []
  const errors = []
  for (const file of fileList) {
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
    if (!ACCEPT.includes(ext)) {
      errors.push(`${file.name}: only .txt and .md files are supported`)
      continue
    }
    const text = (await file.text()).replace(/\r\n/g, '\n')
    if (!text.trim()) errors.push(`${file.name}: file is empty`)
    else if (text.length > maxChars) errors.push(`${file.name}: longer than ${maxChars.toLocaleString()} characters`)
    else files.push({ name: file.name, text })
  }
  return { files, errors }
}
