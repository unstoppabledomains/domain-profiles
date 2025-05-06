# Unstoppable Domains Profile Manager

Set of common tools to manage your Unstoppable Domain 🛠️

[![CI Status](https://github.com/unstoppabledomains/domain-profiles/actions/workflows/push.yml/badge.svg)](https://github.com/unstoppabledomains/domain-profiles/actions/workflows/push.yml)

This repository contains the following:

1. The UD.me profile server, found in the `server` directory
1. Reusable React components, found in the `packages/ui-components` directory
1. Unstoppable Domains configuration variables, found in the `packages/config`
   directory

## Live Endpoints

The UD.me profile service is hosted on both `testnet` (staging) and `mainnet`
(production) environments. Example Unstoppable Domains profiles for each
environment are provided below.

- Staging: https://staging.ud.me/aaron.x
- Production: https://ud.me/quirk.x

## Import into your own project

The React components contained in the `domain-profiles` project can be used in
your own project, and imported directly from NPM. Some of the components
available include:

- Unstoppable Messaging
- Token Gallery
- Domain Profile Management
- Wallet connect modal
- Domain preview popup
- Badges
- More...

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

### Usage

As an example, the following snippet demonstrates how to add Unstoppable
Messaging to your existing Web3 React dApp. The full source code for this
example is available on the
[Unstoppable Domains GitHub](examples/unstoppable-messaging/README.md), and a
[live demo](https://ud.me/examples/unstoppable-messaging) has been provided as
well.

```typescript
import Button from '@mui/material/Button';
import React from 'react';

import {
  BaseProvider,
  UnstoppableMessaging,
  UnstoppableMessagingProvider,
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
    <BaseProvider>
      <UnstoppableMessagingProvider>
        <UnstoppableMessaging />
        <Button onClick={handleOpenChat}>Open chat</Button>
      </UnstoppableMessagingProvider>
    </BaseProvider>
  );
};

export default MyPage;
```

## Contributing

We welcome contributions from the Web3 community. Please feel free to open
issues or pull requests on this repo, and our team will work with you to make
changes.

### Running locally

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
yarn workspace server run dev:staging
```

You can now view the locally running service in your browser. Here are some
example local endpoints for testing.

- http://localhost:3000/aaron.x
- http://localhost:3000/examples/unstoppable-messaging
- http://localhost:3000/examples/domain-management

### Testing

To run the tests locally (`src/**/*.test.tsx` files):

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

### Pull requests

We welcome and encourage pull requests from the community. Some brief notes
about expectations for pull requests:

- Include a good description of the changes you are proposing
- Include unit tests
- Unit tests are run automatically by the CI and must pass before merge
- Staging deployment must be successful before merge (see below)

## Maintainers

Users with write access to this GitHub repository can follow these steps to
manage staging deployments and NPM package management.

### Deployments

#### Pull request

Pull requests can be deployed by the CI to the https://staging.ud.me endpoint.
However, **an authorization by a maintainer is required before the CI will
deploy**. Authorization is made by commenting in the pull request with the
following text:

```
/gcbrun
```

After the comment is made, the CI will initiate a deployment to the staging
endpoint. See
[here](https://github.com/unstoppabledomains/domain-profiles/pull/42#issuecomment-1814532213)
for an example of an authorization comment.

#### Merge

Every merge to `main` results in a deployment to both https://ud.me (production)
and https://staging.ud.me (staging) endpoints. No action is required.

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
