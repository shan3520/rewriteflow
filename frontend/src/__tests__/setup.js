import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

// jsdom lacks matchMedia; the theme context reads it on first render.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  })
}

// jsdom's Blob lacks text()/arrayBuffer(); browsers have both.
function readBlob(blob, method) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader[method](blob)
  })
}
if (!Blob.prototype.text) Blob.prototype.text = function text() { return readBlob(this, 'readAsText') }
if (!Blob.prototype.arrayBuffer) Blob.prototype.arrayBuffer = function arrayBuffer() { return readBlob(this, 'readAsArrayBuffer') }
