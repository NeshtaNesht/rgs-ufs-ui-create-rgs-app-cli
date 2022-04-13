/* eslint-disable */
import TerserPlugin from 'terser-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import * as webpack from 'webpack';
import Dotenv from 'dotenv-webpack';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import { fileName, opts } from './configurations';
import sharedModules from './sharedModules.json';
import 'webpack-dev-server';

delete process.env.TS_NODE_PROJECT;

const config: webpack.Configuration = {
  entry: './src/index',
  mode: 'development',
  devServer: {
    open: true,
    port: 3002,
    host: 'localhost',
    historyApiFallback: true,
  },
  output: {
    publicPath: '/',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    plugins: [new TsconfigPathsPlugin({ baseUrl: 'src' })],
  },
  devtool: 'eval-source-map',
  optimization: {
    runtimeChunk: 'single',
    minimize: false,
    minimizer: [new TerserPlugin({ extractComments: false })],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      },
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /bootstrap\.tsx$/,
        loader: 'bundle-loader',
        options: {
          lazy: true,
        },
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react',
                '@babel/preset-typescript',
              ],
              plugins: ['@babel/plugin-transform-runtime'],
            },
          },
          {
            loader: 'ifdef-loader',
            options: opts,
          },
        ],
      },
      {
        test: /\.svg$/,
        exclude: '/node_modules/',
        use: [
          {
            loader: 'svg-url-loader',
            options: {
              limit: 10000,
            },
          },
        ],
      },
      {
        test: /\.(png|jpeg|jpg|gif|pdf)$/,
        type: 'asset/resource',
        generator: {
          filename: '[name][ext]',
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new Dotenv({ path: './.env.development', silent: false }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.container.ModuleFederationPlugin({
      name: 'clients',
      library: {
        type: 'var',
        name: 'clients',
      },
      filename: fileName,
      exposes: {
        './App': './src/App',
      },
      shared: sharedModules,
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};

export default config;
