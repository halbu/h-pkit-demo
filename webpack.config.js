const path = require('path');

module.exports = {
  entry: path.join(__dirname, 'built/index.js'),
  output: {
      filename: './dist/bundle.js',
      library: 'hpkitLib',
      path: __dirname
  },
  module: {
      rules: [
          {
              test: /\.tsx?$/,
              loader: 'ts-loader',
              exclude: /node_modules/,
          },
      ]
  },
  resolve: {
      extensions: [".tsx", ".ts", ".js"],
      symlinks: false
  },
  optimization: {
      minimize: false
  },
};