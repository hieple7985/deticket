const webpack = require('webpack')

module.exports = function override (config, env) {
  config.resolve.fallback = Object.assign(config.resolve.fallback || {}, {
    crypto: require.resolve('crypto-browserify'),
    path: require.resolve('path-browserify'),
    stream: require.resolve('stream-browserify'),
    assert: require.resolve('assert'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    os: require.resolve('os-browserify'),
    url: require.resolve('url'),
    "buffer": require.resolve("buffer")
  })
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ])
  return config
}
