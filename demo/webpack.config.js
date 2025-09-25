const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './demo/index.tsx',
  output: {
    path: path.resolve(__dirname, '../dist-demo'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '../dist': path.resolve(__dirname, '../dist'),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './demo/index.html',
    }),
  ],
  devServer: {
    static: [
      {
        directory: path.join(__dirname, '../dist-demo'),
      },
      {
        directory: path.join(__dirname, 'assets'),
        publicPath: '/assets',
      }
    ],
    compress: true,
    port: 3000,
    hot: false, // Disable HMR to prevent persistent loading indicators
    liveReload: true, // Enable live reload instead
    client: {
      logging: 'warn', // Reduce console noise
      progress: false, // Disable progress indicator
    },
  },
};
