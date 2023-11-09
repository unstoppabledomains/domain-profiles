# Unstoppable Domains Profile Manager

A set of common tools to manage your Unstoppable Domain 🛠️

[![CI Status](https://github.com/unstoppabledomains/domain-profiles/actions/workflows/push.yml/badge.svg)](https://github.com/unstoppabledomains/domain-profiles/actions/workflows/push.yml)

This repository contains the following:

1. The UD.me profile server, found in the `server` directory
1. Reusable React components, found in the `packages/ui-components` directory
1. Unstoppable Domains configuration variables, found in the `packages/config`
   directory

## Public Endpoints

The UD.me profile service is hosted on both `testnet` (staging) and `mainnet`
(production) environments. Example Unstoppable Domains profiles for each
environment are provided below.

- Staging: https://staging.ud.me/aaron.x
- Production: https://ud.me/quirk.x

### Installation

To use the Unstoppable Domains React components in your own project, install the
package in your project directory:

```shell
// with npm
npm install --save @unstoppabledomains/ui-components

// with yarn
yarn add @unstoppabledomains/ui-components
```

Note the `ui-components` package has peer dependencies on the React and the
React DOM. If you are not already using them in your project, you'll need to
install them (version > 18):

```shell
// with npm
npm install react react-dom

// with yarn
yarn add react react-dom
```

## Usage

The React components contained in the `domain-profiles` project can be used in
your own project, and imported directly from NPM. Some of the components
available include:

- Unstoppable Messaging
- Token Gallery
- Wallet connect modal
- Domain preview popup
- Badges
- More...

As an example, the following demonstrates how to add Unstoppable Messaging to
your existing Web3 React dApp. The full source code for this example is
available on the
[Unstoppable Domains GitHub](examples/unstoppable-messaging/README.md), and a
[live demo](https://ud.me/examples/unstoppable-messaging) has been provided as
well.

```typescript
import Button from '@mui/material/Button';
import React from 'react';

import {
  UnstoppableMessaging,
  UnstoppableMessagingProvider,
  Web3ContextProvider,
  useUnstoppableMessaging,
} from '@unstoppabledomains/ui-components';

const MyPage = () => {
  // Hook provides utility methods, such as opening the Unstoppable
  // Messaging window by clicking a button
  const {setOpenChat} = useUnstoppableMessaging();

  // Open a chat window to a specific user
  const handleOpenChat = () => {
    setOpenChat('friend.x');
  };

  return (
    <Web3ContextProvider>
      <UnstoppableMessagingProvider>
        <UnstoppableMessaging />
        <Button onClick={handleOpenChat}>Open chat</Button>
      </UnstoppableMessagingProvider>
    </Web3ContextProvider>
  );
};

export default MyPage;
```

## Contributing

To contribute changes to the `domain-profiles` project, you'll need to clone the
project and build it in your local environment. The following commands show how
to clone the repo and run the UD.me website locally on your system.

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

Linting is enforced by the CI. This is how to check for and resolve errors
locally for easier resolution of problems.

```shell
yarn lint   # automatically fixes linting errors
yarn format # checks for formatting errors
```

### Publishing to NPM

If you are a developer with access to the
[Unstoppable Domains NPM registry](https://www.npmjs.com/search?q=%40unstoppabledomains),
follow these instructions to publish a new package version. Assume `<package>`
is the NPM package that needs to be published.

- Ensure the version is bumped in `packages/<package>/package.json`
- Update `packages/<package>/CHANGELOG.md` with relevant information
- Authenticate your CLI as appropriate with NPM credentials
- Run the following commands

```shell
yarn dist
cd packages/ < package > /build/src
npm publish
```

Follow the NPM prompts on screen to complete the publish process. Note, it's
important to execute the publish from the package's `build/src` directory for
proper resolution.
