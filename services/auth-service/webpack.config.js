const path = require('path');

module.exports = (options) => ({
  ...options,
  resolve: {
    ...options.resolve,
    alias: {
      ...options.resolve?.alias,
      '@auth-prisma/client': path.resolve(__dirname, 'node_modules/.prisma/auth-client'),
    },
  },
});
