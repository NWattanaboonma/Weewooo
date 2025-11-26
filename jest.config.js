module.exports = {
  // Use the Expo preset so your mobile app tests work
  preset: "jest-expo",

  // Tell Jest to look for tests in BOTH places:
  // 1. The 'test' folder (Server tests)
  // 2. The 'app' folder (Mobile App tests)
  testMatch: [
    "<rootDir>/test/**/*.test.js",
    "<rootDir>/app/**/__tests__/**/*.[jt]s?(x)",
    "<rootDir>/app/**/*.test.[jt]s?(x)",
    "<rootDir>/test/**/__tests__/**/*.[jt]s?(x)",
    "<rootDir>/test/**/*.test.[jt]s?(x)",
    "<rootDir>/test/**/*.(test|spec).[jt]s?(x)"
  ],

  // Setup for your server tests to find the server files
  moduleNameMapper: {
    "^../server/(.*)$": "<rootDir>/server/$1",
    "^@/(.*)$": "<rootDir>/$1" // Keeps your @ alias working for the app
  },

  // Ignore the actual server source code folder to prevent conflicts, 
  // but allow the 'test' folder we just defined.
  testPathIgnorePatterns: [
    "/node_modules/",
    "/server/node_modules/"
  ]
};