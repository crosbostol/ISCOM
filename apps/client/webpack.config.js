// const path = require('path');

// module.exports = {
//   entry: './src/main.ts', // Punto de entrada de tu aplicación
//   output: {
//     filename: 'bundle.js', // Nombre del archivo de salida
//     path: path.resolve(__dirname, './src/app/navegacion'), // Carpeta de salida
//   },
//   devServer: {
//     // Configuración del servidor de desarrollo
//     static: { directory: path.join(__dirname, 'public') },
//     compress:true,
//     host: '0.0.0.0', // Escucha en todas las interfaces
//     port: 4200, // Puerto en el que se ejecutará el servidor
//      // Deshabilita la verificación del encabezado del host
//   },
//   resolve: {
//     alias: {
//       'chart.js': 'chart.js/dist/Chart.js', // Agrega esta línea
//     },
//     extensions: ['.ts', '.js', '.json'], // Agrega '.ts' a las extensiones
//   },
//   module: {
//     rules: [
//       {
//         test: /\.ts$/,
//         use: 'ts-loader',
//         exclude: /node_modules/,
//       },
//     ],
//   },
//   // Otras configuraciones específicas de tu proyecto...
// };
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/main.ts',
  mode: 'development',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 4200,
    historyApiFallback: true,
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      favicon: './src/favicon.ico',
    }),
  ],
};
