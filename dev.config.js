const path = require('path');
const webpack = require('webpack');

const host = 'localhost';
const port = 3000;

module.exports = {
  devtool: 'eval-cheap-module-source-map',
  devServer: { host, port, https: true },
  entry: {
    popup: path.join(__dirname, '/chrome/src/popup'),
    background: path.join(__dirname, '/chrome/src/background')
  },
  output: {
    path: path.join(__dirname, '/dev/js/'),
    filename: '[name].bundle.js',
    chunkFilename: '[id].chunk.js',
    publicPath: `https://${host}:${port}/js/`
  },
  resolve: {
    extensions: ['', '.js']
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      exclude: /node_modules/,
      query: {
        presets: ['react-hmre']
      }
    },{
      test: /\.css$/,
      loaders: ['style', 'css'],
      exclude: /node_modules/
    }]
  }
}
