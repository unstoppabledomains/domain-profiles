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

As an example, the following demonstrates how to add Unstoppable Messaging to your
existing Web3 React dApp. For a full working example, see the [Unstoppable Messaging
Next.js demo](examples/unstoppable-messaging/README.md).

```typescript
import Button from '@mui/material/Button';
import {
   UnstoppableMessaging,
   UnstoppableMessagingProvider,
   Web3ContextProvider,
   useUnstoppableMessaging,
} from '@unstoppabledomains/ui-components';
import React from 'react';

// Hardcoded user information as an example. This information should come
// from a connected wallet in a real world scenario.
const myDomain = "mydomain.x";
const myAddress = "0x123";

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
            <UnstoppableMessaging domain={myDomain} address={myAddress} />
            <Button
               onClick={handleOpenChat}
            >
               Open chat
            </Button>
         </UnstoppableMessagingProvider>
      </Web3ContextProvider>
   )
}

export default MyPage;
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
