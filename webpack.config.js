const path = require('path');
const HtmlPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const plugins = [
  new HtmlPlugin({
    template: 'index.html',
    favicon: 'favicon.ico'
  })
];

module.exports = {
  mode: 'development',
  context: path.resolve(__dirname, 'ui'),
  entry: {
    app: ['./index.tsx']
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    path: path.resolve(__dirname, 'static'),
    filename: 'js/[name].[chunkhash:5].js'
  },
  devtool: 'source-map',
  plugins: plugins,
  optimization: {
    splitChunks: {
      cacheGroups: {
        lib: {
          name: 'lib',
          chunks: 'all',
          test: /[\\/]node_modules[\\/]/
        }
      }
    },
    minimizer: [new TerserPlugin({
      extractComments: false,
      terserOptions: {
        output: {
          comments: false,
        },
      },
    })],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'ui/'),
    },
    host: '127.0.0.1',
    port: 3000,
    compress: true,
    proxy: [
      {
        target: 'http://127.0.0.1:8080',
        context: ['/collections', '/variables', '/jobs']
        // pathRewrite: {'^/api' : ''}
      }
    ]
  }
};
