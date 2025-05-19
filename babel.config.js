// explicacion paso a paso de como funciona el código de configuración de babel.config.js
module.exports = function (api) {
  //Cachea la configuración para acelerar las compilaciones
  api.cache(true);
  return {
    // Preset de Expo (incluye React Native y todas las transformaciones necesarias)
    presets: ['babel-preset-expo'],
    // Plugins: primero el de dotenv, y siempre al final
    plugins: [
      // Plugin para cargar variables desde .env
      ['module:react-native-dotenv', {
        moduleName: '@env',    // alias que usarás en tu código: `import { MI_VAR } from '@env'`
        path: '.env',          // ruta a tu archivo de variables (relativa a la raíz)
        safe: false,           // true para exigir un archivo .env.example con todas las variables
        allowUndefined: true,  // no fallará si alguna variable no está definida
      }],
      // Plugin obligatorio de Reanimated; siempre debe ir al último lugar
      'react-native-reanimated/plugin',
    ],
  };
};
