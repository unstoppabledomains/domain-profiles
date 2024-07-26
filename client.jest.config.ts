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
    '^.+\\.css$': 'jest-transform-css',
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        isolatedModules: false,
      },
    ],
  },
  moduleDirectories: ['node_modules', '<rootDir>/server'],
  testPathIgnorePatterns: ['/node_modules/', '/build/'],
  moduleNameMapper: {
    ['@bugsnag/(.*)']: '<rootDir>/tests/mocks/empty.js',
    ['viem/chains']: '<rootDir>/tests/mocks/empty.js',
    ['@xmtp/(.*)']: '<rootDir>/tests/mocks/empty.js',
    ['@pushprotocol/(.*)']: '<rootDir>/tests/mocks/empty.js',
    ['@ipld/(.*)']: '<rootDir>/tests/mocks/empty.js',
    ['@ucanto/(.*)']: '<rootDir>/tests/mocks/empty.js',
    'web3.storage': '<rootDir>/tests/mocks/empty.js',
    ['wagmi']: '<rootDir>/tests/mocks/empty.js',
    ['is-ipfs']: '<rootDir>/tests/mocks/empty.js',
    'react-medium-image-zoom': '<rootDir>/tests/mocks/empty.js',
    'swiper/react': '<rootDir>/tests/mocks/swiper-react/index.tsx',
    ['swiper']: '<rootDir>/node_modules/swiper/swiper-bundle.js',
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
