const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
    mode: 'production',
    entry: './src/index.js',
    target: 'web',
    module: {
        rules: [
            {
                test: /\.js|\.mjs|\.cjs$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            "@babel/env",
                        ]
                    },
                },
            },
        ],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new Dotenv({
            path: './env/.env',
        }),
        new HtmlWebpackPlugin({
            template: './public/index.html',
            favicon: './public/favicon.png',
        }),
        new CopyWebpackPlugin({
            patterns: [
                {from: './public/ads.txt', to: 'ads.txt'},
                {from: './public/img/', to: 'img/'},
            ]
        }),
        new CleanWebpackPlugin(),
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, "./public"),
        },
        compress: true,
        port: process.env.PORT,
    }
};