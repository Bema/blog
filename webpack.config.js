const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MarkDonwToStaticHTMLPlugin = require('./markdown-to-static-plugin');

module.exports = {
    context: path.join(__dirname, 'app'),
    entry: './main.js',
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, 'dist'),
        libraryTarget: 'umd'
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    module: {
        loaders: [{
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015', 'react']
                }
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg|mp4)$/,
                loader: 'url-loader?limit=100000'
            },
            {
                test: /\.(otf|ttf|eot|woff(2)?)(\?[a-z0-9]+)?$/,
                loader: 'file-loader'
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
            hash: true
        }),
        new MarkDonwToStaticHTMLPlugin({
          template: 'index.html',
          path: '/posts'
        })
    ]
}
