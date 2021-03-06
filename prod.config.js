const path = require('path');
const webpack = require('webpack');


module.exports = {
  entry: {
    popup: path.join(__dirname, '/chrome/src/popup'),
    background: path.join(__dirname, '/chrome/src/background')
  },
  output: {
    path: path.join(__dirname, '/build/js'),
    filename: '[name].bundle.js',
    chunkFilename: '[id].chunk.js'
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.IgnorePlugin(/[^/]+\/[\S]+.dev$/),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      comments: false,
      compressor: {
        warnings: false
      }
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  ],
  resolve: {
    extensions: ['', '.js']
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      exclude: /node_modules/
    },
    {
      test: /\.css$/,
      loaders: ['style', 'css'],
      exclude: /node_modules/
    }]
  }
}
