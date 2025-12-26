const path = require('path');
const webpack = require('webpack');
const HtmlPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const plugins = [
  new HtmlPlugin({
    template: 'index.html',
    favicon: 'favicon.ico',
  }),
  new webpack.DefinePlugin({
    'process.env.VERSION': JSON.stringify(process.env.VERSION ?? '0.0.0-dev'),
  }),
];

/**
 * @param {Record<string, unknown>} env
 * @param {Record<string, unknown>} argv
 * @returns {import('webpack').Configuration}
 */
module.exports = (env, argv) => {
  // const development = argv.mode !== 'production';
  return {
    mode: argv.mode ?? 'development',
    context: path.resolve(__dirname, 'src'),
    entry: {
      app: ['./index.tsx'],
    },
    resolve: {
      alias: {
        $shared: path.resolve(__dirname, 'src/shared'),
        $features: path.resolve(__dirname, 'src/features'),
      },
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      path: path.resolve(__dirname, '../api/static'),
      filename: 'js/[name].[chunkhash:5].js',
      clean: true,
    },
    plugins: plugins,
    optimization: {
      splitChunks: {
        cacheGroups: {
          lib: {
            name: 'lib',
            chunks: 'all',
            test: /node_modules/,
          },
        },
      },
      minimizer: [
        new TerserPlugin({
          extractComments: false,
          terserOptions: {
            output: {
              comments: false,
            },
          },
        }),
      ],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options: {transpileOnly: true},
          },
          exclude: /node_modules/,
        },
      ],
    },
    devServer: {
      static: {
        directory: path.join(__dirname, 'src/'),
      },
      host: '127.0.0.1',
      allowedHosts: 'localhost',
      port: 3000,
      compress: true,
      proxy: [
        {
          target: 'http://127.0.0.1:8080',
          context: ['/collections', '/variables', '/jobs'],
          // pathRewrite: {'^/api' : ''}
        },
      ],
    },
  };
};
