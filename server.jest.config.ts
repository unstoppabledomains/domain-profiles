import {lstatSync, readdirSync} from 'fs';
import path from 'path';
import type {InitialOptionsTsJest} from 'ts-jest/dist/types';

const sharedBasePath = path.resolve(__dirname, 'packages');
const sharedModules = readdirSync(sharedBasePath).filter(name => {
  return lstatSync(path.join(sharedBasePath, name)).isDirectory();
});

const config: InitialOptionsTsJest = {
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
  moduleNameMapper: {
    ['@xmtp/(.*)']: '<rootDir>/tests/mocks/empty.js',
    ...sharedModules.reduce(
      (acc, name) => ({
        ...acc,
        [`@unstoppabledomains/${name}/src/(.*)$`]: `<rootDir>/packages/${name}/src/$1`,
        [`@unstoppabledomains/${name}(.*)$`]: `<rootDir>/packages/${name}/src/$1`,
      }),
      {},
    ),
  },
};

export default config;
