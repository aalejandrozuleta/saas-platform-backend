const path = require('node:path');

const webpackConfig = (options) => ({
  ...options,
  resolve: {
    ...options.resolve,
    alias: {
      ...options.resolve?.alias,
    },
  },
});

module.exports = webpackConfig;
