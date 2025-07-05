module.exports = () => ({
  name: "transform-import-meta",
  visitor: {
    MetaProperty(path) {
      if (path.node.meta.name === "import" && path.node.property.name === "meta") {
        // Reemplazar import.meta con un objeto seguro
        path.replaceWithSourceString(`{
            env: (typeof process !== "undefined" ? process.env : {}),
            url: (typeof window !== "undefined" ? window.location.href : "file:///")
          }`)
      }
    },
    // También manejar casos donde import.meta.env se usa directamente
    MemberExpression(path) {
      if (
        path.node.object &&
        path.node.object.type === "MetaProperty" &&
        path.node.object.meta.name === "import" &&
        path.node.object.property.name === "meta"
      ) {
        if (path.node.property.name === "env") {
          path.replaceWithSourceString(`(typeof process !== "undefined" ? process.env : {})`)
        } else if (path.node.property.name === "url") {
          path.replaceWithSourceString(`(typeof window !== "undefined" ? window.location.href : "file:///")`)
        }
      }
    },
  },
})
