// eslint-disable-next-line import/extensions
import nextJest from "next/jest.js";

// Following config setup from
// https://nextjs.org/docs/pages/building-your-application/optimizing/testing#setting-up-jest-with-the-rust-compiler
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

/** @type {import('jest').Config} */
const config = {
  clearMocks: true,
  coverageDirectory: "coverage",
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json"],
  rootDir: ".",
  preset: "ts-jest",
  transformIgnorePatterns: [`/node_modules/(?!nanoid)`],
  moduleNameMapper: {
    "\\.(css|scss)$": "<rootDir>/tests/cssFileMock.js",
    "^nanoid(/(.*)|$)": "nanoid$1",
  },
  setupFilesAfterEnv: ["jest-extended/all", "@testing-library/jest-dom"],
  testEnvironment: "jest-environment-jsdom",
  testPathIgnorePatterns: ["/node_modules/", "/e2e/"],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
