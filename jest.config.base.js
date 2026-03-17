module.exports = {
  testEnvironment: 'node', // Crucial for backend testing (no DOM)
  verbose: true,
  clearMocks: true, // Automatically clear mock calls and instances between every test
  coveragePathIgnorePatterns: ['/node_modules/'],
  testTimeout: 30000, // Increase timeout to handle async operations
  forceExit: true, // Force Jest to exit after all tests complete
  detectOpenHandles: false, // Set to true if you still have issues to debug
};