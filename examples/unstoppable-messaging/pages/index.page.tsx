import Button from '@mui/material/Button';
import React from 'react';

import {
  UnstoppableMessaging,
  UnstoppableMessagingProvider,
  Web3ContextProvider,
  useUnstoppableMessaging,
} from '@unstoppabledomains/ui-components';

// Hardcoded user information as an example. This information should come
// from a connected wallet in a real world scenario.
const myDomain = 'mydomain.x';

const MyPage = () => {
  // Hook provides utility methods, such as opening the Unstoppable
  // Messaging window by clicking a button
  const {setOpenChat} = useUnstoppableMessaging();

  return (
    <Web3ContextProvider>
      <UnstoppableMessagingProvider>
        <div>
          <UnstoppableMessaging domain={myDomain} />
        </div>
        <Button onClick={() => setOpenChat('friend.x')}>Open chat</Button>
      </UnstoppableMessagingProvider>
    </Web3ContextProvider>
  );
};

export default MyPage;
