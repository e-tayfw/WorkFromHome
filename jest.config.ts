const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const config = {
  preset: "ts-jest", // Use ts-jest to work with TypeScript
  testEnvironment: "jest-environment-jsdom", // Use jsdom for React component testing
  setupFilesAfterEnv: ["<rootDir>/setupTests.ts"], // Optional: Path to setup file
};
// module.exports = {
//   preset: "ts-jest", // Use ts-jest to work with TypeScript
//   testEnvironment: "jsdom", // Use jsdom for React component testing
//   setupFilesAfterEnv: ["<rootDir>/setupTests.ts"], // Optional: Path to setup file
//   transform: {
//     "^.+\\.[tj]sx?$": "babel-jest", // Use babel-jest to transform JS/TS files, including JSX
//   },
//   moduleNameMapper: {
//     "^@/(.*)$": "<rootDir>/src/$1", // Adjust path alias to your src folder
//   },
//   // transformIgnorePatterns: ["<rootDir>/node_modules/"], // Ignore transforming node_modules
// };

module.exports = createJestConfig(config)
