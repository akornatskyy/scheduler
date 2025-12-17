const path = require('path');
const HtmlPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const plugins = [
  new HtmlPlugin({
    template: 'index.html',
    favicon: 'favicon.ico',
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
    context: path.resolve(__dirname, 'ui'),
    entry: {
      app: ['./index.tsx'],
    },
    resolve: {
      alias: {
        $shared: path.resolve('ui/shared'),
        $features: path.resolve('ui/features'),
      },
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      path: path.resolve(__dirname, 'static'),
      filename: 'js/[name].[chunkhash:5].js',
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
        directory: path.join(__dirname, 'ui/'),
      },
      host: '127.0.0.1',
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
