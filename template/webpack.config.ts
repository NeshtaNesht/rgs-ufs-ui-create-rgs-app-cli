/* eslint-disable */
import TerserPlugin from 'terser-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import * as path from 'path';
import * as webpack from 'webpack';
import Dotenv from 'dotenv-webpack';
import dotenv from 'dotenv';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import sharedModules from './sharedModules.json';
import { opts, fileName } from './configurations';

dotenv.config({ path: './.env' });

delete process.env.TS_NODE_PROJECT;

const ModuleFederationPlugin = webpack.container.ModuleFederationPlugin;

const config: webpack.Configuration = {
  entry: './src/index',
  mode: 'production',
  output: {
    path: path.resolve(__dirname, './build'),
    publicPath: process.env.MODULE_PUBLIC_PATH,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    plugins: [new TsconfigPathsPlugin({ baseUrl: 'src' })],
  },
  devtool: 'source-map',
  optimization: {
    minimize: true,
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
    new Dotenv({ path: path.resolve(__dirname, './.env') }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new ModuleFederationPlugin({
      name: process.env.MODULE_NAME,
      library: {
        type: 'var',
        name: process.env.MODULE_NAME,
      },
      filename: fileName,
      exposes: {
        './App': './src/App',
      },
      shared: sharedModules,
    }),
  ],
};

export default config;
