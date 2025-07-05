// Polyfill for import.meta
if (typeof globalThis.importMeta === "undefined") {
  globalThis.importMeta = {}
}

if (typeof global.importMeta === "undefined") {
  global.importMeta = {}
}

// Export empty object to avoid import.meta errors
export default {}
