# Unstoppable Domains Config

A common configuration reference for Unstoppable Domains environments 🛠️

[![CI Status](https://github.com/unstoppabledomains/domain-profiles/actions/workflows/push.yml/badge.svg)](https://github.com/unstoppabledomains/domain-profiles/actions/workflows/push.yml)

### Installation

To use the Unstoppable Domains config in your own project, install the module in
your project directory:

```shell
// with npm
npm install --save @unstoppabledomains/config

// with yarn
yarn add @unstoppabledomains/config
```

## Usage

```typescript
import config from '@unstoppabledomains/config';

console.log(
  'Unstoppable Domains smart contract',
  config.UNSTOPPABLE_CONTRACT_ADDRESS,
);
```

## Contributing

To contribute changes to the `domain-profiles` project, you'll need to clone the
project and build it in your local environment.

```shell
# Clone the project
git clone git@github.com:unstoppabledomains/domain-profiles.git
cd domain-profiles

# Build the project locally
yarn install # install dependencies
yarn build   # build shared packages

# Run the development server
yarn workspace server run dev
```

### Testing

To run the tests (`src/**/*.test.tsx` files):

```shell
yarn test    # run all tests
yarn test:ci # run all tests and generate coverage report
```

### Linting and code formatting

```shell
yarn lint   # automatically fixes linting errors
yarn format # checks for formatting errors
```
