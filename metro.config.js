const { getDefaultConfig } = require("expo/metro-config")
const path = require("path")

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname)

// Configurar resolver para manejar mejor los módulos
config.resolver.alias = {
  "@": path.resolve(__dirname),
}

// Ensure that all platforms are supported
config.resolver.platforms = ["native", "web", "ios", "android"]

// Asegurar que se manejen correctamente los archivos TypeScript
config.resolver.sourceExts.push("cjs")

// Configurar transformer
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
})

// Configurar para manejar mejor los módulos problemáticos
config.resolver.resolverMainFields = ["react-native", "browser", "main"]

module.exports = config
