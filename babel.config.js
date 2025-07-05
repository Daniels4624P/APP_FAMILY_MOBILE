module.exports = (api) => {
  api.cache(true)
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Plugin simple para reemplazar import.meta
      [
        "transform-inline-environment-variables",
        {
          include: ["NODE_ENV"],
        },
      ],
      // Plugin adicional para casos específicos
      () => ({
        visitor: {
          MetaProperty(path) {
            if (path.node.meta.name === "import" && path.node.property.name === "meta") {
              path.replaceWith(path.scope.buildUndefinedNode())
            }
          },
        },
      }),
    ],
  }
}
