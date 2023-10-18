import type {InitialOptionsTsJest} from 'ts-jest/dist/types';

const config: InitialOptionsTsJest = {
  projects: [
    '<rootDir>/client.jest.config.ts',
    '<rootDir>/server.jest.config.ts',
  ],
  coverageProvider: 'v8',
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/build/**',
  ],
  coveragePathIgnorePatterns: [
    '**/build',
    'e2e/',
    '**/node_modules/',
    'setupTests.ts',
    'global.ts',
    'package.json',
  ],
  testTimeout: 60000,
  reporters: ['default', 'github-actions'],
  verbose: true,
  // A map from regular expressions to module names that allow to stub out resources with a single module
  moduleNameMapper: {
    '@unstoppabledomains/(.*)': '<rootDir>/../packages/src/$1',
    '@unstoppabledomains': '<rootDir>/../packages/src',
  },
};

export default config;
