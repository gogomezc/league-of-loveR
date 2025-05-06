const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Agrega soporte a .cjs (por firebase internamente)
config.resolver.sourceExts.push('cjs');

// Desactiva el uso de "packageExports" para compatibilidad
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
