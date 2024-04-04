const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.tsx', // Entry point of your application (TypeScript file)
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.js',
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'], // Add TypeScript extensions
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/, // Apply ts-loader to .ts and .tsx files
                exclude: /node_modules/,
                use: 'ts-loader',
            },
            {
                test: /\.js$/, // Apply Babel to .js files
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                    },
                },
            },
            {
                test: /\.css$/, // Apply loaders for CSS files
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.svg$/, // Apply loaders for SVG files
                use: ['@svgr/webpack', 'url-loader'],
            },
            {
                test: /\.scss$/, // Apply loaders for Sass files
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
        }),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            process: 'process/browser',
        }),
    ],
    devServer: {
        port: 3000,
        hot: true,
    },
};
