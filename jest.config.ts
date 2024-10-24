import nextJest from "next/jest";

import { pathsToModuleNameMapper } from "ts-jest";
import { compilerOptions } from "./tsconfig.json";



const createJestConfig = nextJest({
  dir: "./",
});

const config = {
  preset: "ts-jest", // Use ts-jest to work with TypeScript
  testEnvironment: "jest-environment-jsdom", // Use jsdom for React component testing
  setupFilesAfterEnv: ["<rootDir>/setupTests.ts"], // Optional: Path to setup file
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/",
  }),
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.jest.json",
    },
  },
  coverageDirectory: "coverage", // Specify the output directory
  coverageReporters: ["json", "lcov", "text", "clover"], // Define coverage report formats
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

module.exports = createJestConfig(config);
