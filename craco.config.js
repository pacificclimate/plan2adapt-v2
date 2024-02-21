// craco.config.js
const webpack = require('webpack');

module.exports = {
    webpack: {
        configure: (webpackConfig, { env, paths }) => {
            webpackConfig.resolve.fallback = {
                ...webpackConfig.resolve.fallback,
                path: require.resolve('path-browserify'),
                stream: require.resolve('stream-browserify'),
                buffer: require.resolve('buffer/'),
                process: require.resolve('process/browser'),
            };
            webpackConfig.plugins.push(
                new webpack.ProvidePlugin({
                    process: 'process/browser',
                })
            );
            return webpackConfig;
        },
    },
};

