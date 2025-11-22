module.exports = {
  // Tell Jest to look for tests in the root `test` directory
  testMatch: ['<rootDir>/test/**/*.test.js'],

  // Tell Jest where to find the node modules for the server
  moduleDirectories: ['node_modules', 'server/node_modules'],

  // This helps Jest understand that when a test file asks for '../server/server',
  // it should look in the correct directory.
  moduleNameMapper: {
    '^../server/(.*)$': '<rootDir>/server/$1',
  },
};
