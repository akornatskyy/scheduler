const prod = !!process.env.NODE_ENV && process.env.NODE_ENV.startsWith('prod');
const path = require('path');
const pkg = require('./package.json');
const webpack = require('webpack');
const HtmlPlugin = require('html-webpack-plugin');

const plugins = [
  new HtmlPlugin({
    template: 'index.html',
    favicon: 'favicon.ico',
    minify: true
  })
];

if (prod) {
  const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
  plugins.push(
      new webpack.optimize.OccurrenceOrderPlugin(),
      new UglifyJsPlugin()
  );
}

module.exports = {
  mode: prod ? 'production' : 'development',
  context: path.resolve(__dirname, 'ui'),
  entry: {
    lib: Object.keys(pkg.dependencies),
    app: ['./index.js']
  },
  output: {
    path: path.resolve(__dirname, 'static'),
    filename: 'js/[name].[chunkhash:5].js'
  },
  plugins: plugins,
  performance: {
    maxEntrypointSize: 360000,
    maxAssetSize: 320000
  },
  optimization: {
    noEmitOnErrors: true,
    splitChunks: {
      cacheGroups: {
        commons: {
          chunks: 'initial',
          minChunks: 2,
          name: 'lib',
          minSize: 0
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, 'ui/'),
    compress: true,
    host: '0.0.0.0',
    port: 3000,
    proxy: [
      {
        target: 'http://127.0.0.1:8080',
        context: ['/collections', '/variables', '/jobs']
        // pathRewrite: {'^/api' : ''}
      }
    ]
  }
};
