// Polyfill inmediato para import.meta
;(() => {
  // Definir import.meta de forma global antes que cualquier otro código
  if (typeof globalThis !== "undefined") {
    if (!globalThis.importMeta) {
      Object.defineProperty(globalThis, "importMeta", {
        value: {
          env: typeof process !== "undefined" ? process.env : {},
          url: typeof window !== "undefined" ? window.location.href : "file:///",
        },
        writable: false,
        configurable: false,
      })
    }
  }

  if (typeof global !== "undefined") {
    if (!global.importMeta) {
      Object.defineProperty(global, "importMeta", {
        value: {
          env: typeof process !== "undefined" ? process.env : {},
          url: typeof window !== "undefined" ? window.location.href : "file:///",
        },
        writable: false,
        configurable: false,
      })
    }
  }

  if (typeof window !== "undefined") {
    if (!window.importMeta) {
      Object.defineProperty(window, "importMeta", {
        value: {
          env: typeof process !== "undefined" ? process.env : {},
          url: window.location.href,
        },
        writable: false,
        configurable: false,
      })
    }
  }

  // Polyfill adicional para casos edge
  if (typeof self !== "undefined" && !self.importMeta) {
    Object.defineProperty(self, "importMeta", {
      value: {
        env: {},
        url: typeof location !== "undefined" ? location.href : "file:///",
      },
      writable: false,
      configurable: false,
    })
  }

  console.log("✅ Import.meta polyfill loaded successfully")
})()

// Export para compatibilidad con módulos
export default {}
