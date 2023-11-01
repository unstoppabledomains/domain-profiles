import {lstatSync, readdirSync} from 'fs';
import path from 'path';
import type {InitialOptionsTsJest} from 'ts-jest/dist/types';

const sharedBasePath = path.resolve(__dirname, 'packages');
const sharedModules = readdirSync(sharedBasePath).filter(name => {
  return lstatSync(path.join(sharedBasePath, name)).isDirectory();
});

const config: InitialOptionsTsJest = {
  preset: 'ts-jest',
  testEnvironment: '<rootDir>/tests/jest-environment-jsdom.ts',
  resolver: '<rootDir>/tests/resolver.js',
  setupFiles: ['<rootDir>/tests/setupTests.ts', 'jest-canvas-mock'],
  setupFilesAfterEnv: [
    '<rootDir>/tests/setupTestsAfterEnv.ts',
    'jest-extended/all',
  ],
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
  testPathIgnorePatterns: ['/node_modules/', '/build/'],
  moduleNameMapper: {
    ['@xmtp/(.*)']: '<rootDir>/tests/mocks/empty.js',
    ['@pushprotocol/(.*)']: '<rootDir>/tests/mocks/empty.js',
    'web3.storage': '<rootDir>/tests/mocks/empty.js',
    ['wagmi']: '<rootDir>/tests/mocks/empty.js',
    'react-medium-image-zoom': '<rootDir>/tests/mocks/empty.js',
    ['swiper(.*)']: '<rootDir>/tests/mocks/empty.js',
    ...sharedModules.reduce(
      (acc, name) => ({
        ...acc,
        [`@unstoppabledomains/${name}/src/(.*)$`]: `<rootDir>/packages/${name}/src/$1`,
        [`@unstoppabledomains/${name}(.*)$`]: `<rootDir>/packages/${name}/src/$1`,
      }),
      {},
    ),
    ...['styles', 'tests'].reduce(
      (acc, name) => ({
        ...acc,
        [`^${name}/(.*)$`]: `<rootDir>/server/${name}/$1`,
      }),
      {},
    ),
  },
};

export default config;
