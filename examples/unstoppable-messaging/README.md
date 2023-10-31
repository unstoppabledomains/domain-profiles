# Unstoppable Messaging demo

A simple demo of Unstoppable Messaging in a Next.js app.

## Overview

The `@unstoppabledomains/ui-components` package enables your app to provide many features
for Web3 users. The ability to chat within your app is demonstrated in this simple Next.js
app. The demo app is intentionally simplistic, and is meant to be starting point to show
how the features could be integrated into your own app.

![Unstoppable Messaging](https://github.com/unstoppabledomains/domain-profiles/assets/21039114/6058a46d-e086-468c-a61d-14f947de8610)

### Running locally

You can run this demo locally using the following commands.

```shell
git@github.com:unstoppabledomains/domain-profiles.git
cd domain-profiles/examples/unstoppable-messaging
yarn install
yarn run dev
```

The application will be available locally to your browser at [http://localhost:3000](http://localhost:3000).

### Structure

#### Providers
The demo application takes advantage of two important React providers, which are provided
as part of the `@unstoppabledomains/ui-components` package. The providers are defined in
the `pages/_app.page.tsx` file.

- `Web3ContextProvider`
  - Manages wallet connection state for the Unstoppable Messaging app
  - Provides React hooks to Unstoppable Messaging to open wallet prompts
- `UnstoppableMessagingProvider`
  - Manages messaging state
  - Provides React hooks to control Unstoppable Messaging window behavior

#### Main page

The main application page renders the `UnstoppableMessaging` React component and uses a
provided hook to control the chat window opening and closing. The main application page
is defined in the `pages/index.page.tsx` file.

```typescript
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import React from 'react';

import {
  UnstoppableMessaging,
  useUnstoppableMessaging,
} from '@unstoppabledomains/ui-components';

const MyPage = () => {
  // Hook provides utility methods, such as opening the Unstoppable
  // Messaging window by clicking a button
  const {setOpenChat} = useUnstoppableMessaging();

  // Hard coded domain and address. In a real world scenarios these would
  // be retrieved from a wallet connection
  const myDomain = 'quirk.x';
  const myAddress = '0xCD0DAdAb45bAF9a06ce1279D1342EcC3F44845af';

  // Open a chat window to a specific user
  const handleOpenChat = () => {
    setOpenChat('lisa.x');
  };

  return (
    <Paper sx={{margin: 5, padding: 5}}>
      <Box display="flex" marginTop={1}>
        <UnstoppableMessaging domain={myDomain} address={myAddress} />
        <Button variant="contained" onClick={handleOpenChat}>
          Open chat
        </Button>
      </Box>
    </Paper>
  );
};

export default MyPage;
```
