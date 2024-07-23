import type {JestConfigWithTsJest} from 'ts-jest/dist/types';

const config: JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/tests/setupTests.ts'],
  setupFilesAfterEnv: ['jest-extended/all'],
  testMatch: ['<rootDir>/**/?(*.)+(spec|test).[jt]s'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        isolatedModules: false,
      },
    ],
  },
  testPathIgnorePatterns: ['/node_modules/', '/build/', '/e2e/'],
};

export default config;
