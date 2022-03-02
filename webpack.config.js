const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        'index': './src/js/index.js',
    },
    devtool: 'inline-source-map',
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: './static/**/**',
                    to: './'
                }
            ]
        }),
        new CleanWebpackPlugin({
            verbose: true
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/index.html',
            title: 'maj',
            inject: 'body',
            hash: true,
            chunks: ['index']
        })
    ],
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ],

    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'dist')
    },
    watchOptions: {
        poll: 1000,
        aggregateTimeout: 1000,
        ignored: /node_modules/,
    }
}