import {lstatSync, readdirSync} from 'fs';
import path from 'path';
import type {InitialOptionsTsJest} from 'ts-jest/dist/types';

const sharedBasePath = path.resolve(__dirname, 'packages');
const sharedModules = readdirSync(sharedBasePath).filter(name => {
  return lstatSync(path.join(sharedBasePath, name)).isDirectory();
});

const config: InitialOptionsTsJest = {
  preset: 'ts-jest',
  resolver: '<rootDir>/test/resolver.js',
  setupFiles: ['<rootDir>/test/setupTests.ts'],
  setupFilesAfterEnv: ['jest-extended/all'],
  testMatch: ['<rootDir>/**/?(*.)+(spec|test).[jt]sx'],
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
    '@xmtp/xmtp-js': '<rootDir>/test/mocks/xmtp/mock.js',
    ...sharedModules.reduce(
      (acc, name) => ({
        ...acc,
        [`@unstoppabledomains/${name}(.*)$`]: `<rootDir>/packages/${name}/$1`,
      }),
      {},
    ),
  },
};

export default config;
