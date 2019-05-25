//output: { path: '../front/javascripts', filename: 'bundle.js' },
const webpack = require('webpack')
var CompressionPlugin = require('compression-webpack-plugin');
module.exports = {
    entry: './app.jsx',
    output: { path: '../front/javascripts', filename: 'bundle.js' },
    devtool: 'source-map',
    debug: true,
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    module: {
        loaders: [
            {
                // test: /.jsx?$/,
                test: /\.(js|jsx)$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015', 'react']
                }
            },
            { test: /\.css$/, loader: "style-loader!css-loader" },

        ],
        plugins: [
            new webpack.DefinePlugin({
              'process.env': {
                'NODE_ENV': JSON.stringify('production')
              }
            }),
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.UglifyJsPlugin(),
            new webpack.optimize.AggressiveMergingPlugin(),
            new CompressionPlugin({
              asset: "[path].gz[query]",
              algorithm: "gzip",
              test: /\.js$|\.css$|\.html$/,
              threshold: 10240,
              minRatio: 0.8
            })
          ]
    },
};