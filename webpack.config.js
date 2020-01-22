const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

/**
 * @type {import('webpack').ConfigurationFactory}
 */
module.exports = (env = {}) => {
  const { dev } = env;
  return {
    mode: dev ? 'development' : 'production',
    entry: {
      index: ['./src/index.ts'],
    },
    resolve: {
      extensions: ['.ts', '.mjs', '.js', '.json'],
      alias: {
        semver$: 'semver/preload',
      },
    },
    output: { libraryTarget: 'commonjs2' },
    devtool: 'source-map',
    target: 'node',
    module: {
      rules: [
        {
          exclude: /node_modules/,
          test: /\.ts$/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),
      // new webpack.IgnorePlugin({ resourceRegExp: /iconv-loader$/ }),
      new ForkTsCheckerWebpackPlugin({ async: true }),
    ],
    watchOptions: {
      ignored: /\.test\.ts$/,
    },
  };
};
