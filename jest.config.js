module.exports = {
  verbose: true,
  testEnvironment: 'node',
  testMatch: [
      "**/test/**/*.test.js"
  ],
  "setupFilesAfterEnv": [
    "./src/test/setupTestFramework.js"
  ]
};
