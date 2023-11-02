import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import React from 'react';
import {CodeBlock, dracula} from 'react-code-blocks';

import {
  UnstoppableMessaging,
  useUnstoppableMessaging,
} from '@unstoppabledomains/ui-components';

const exampleCode = `import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import React from 'react';

const UnstoppableMessagingDemo = () => {
  // Hook provides utility methods, such as opening the Unstoppable
  // Messaging window by clicking a button
  const {isChatReady, setOpenChat} = useUnstoppableMessaging();

  // Open a chat window to a specific user
  const handleOpenChat = () => {
    setOpenChat(myFriendDomain);
  };

  return (
    <Paper sx={{margin: 5, padding: 5}}>
      <Box display="flex" marginTop={2}>
        <UnstoppableMessaging />
        <Button variant="contained" onClick={handleOpenChat}>
          {isChatReady ? 'Open chat with quirk.x' : 'Setup chat'}
        </Button>
      </Box>
    </Paper>
  )
};`;

const UnstoppableMessagingDemo = () => {
  // Hook provides utility methods, such as opening the Unstoppable
  // Messaging window by clicking a button
  const {isChatReady, setOpenChat} = useUnstoppableMessaging();

  // Use a domain to demonstrate opening the chat window to a specific
  // conversation using a hook
  const myFriendDomain = 'quirk.x';

  // Open a chat window to a specific user
  const handleOpenChat = () => {
    setOpenChat(myFriendDomain);
  };

  return (
    <>
      <Paper sx={{margin: 5, padding: 5}}>
        <Typography variant="h5">Unstoppable Messaging Demo</Typography>
        <Typography variant="body1">
          The source code for this demo and the included React components can be
          found{' '}
          <a href="https://github.com/unstoppabledomains/domain-profiles/tree/main/examples/unstoppable-messaging">
            here
          </a>{' '}
          on GitHub.
        </Typography>
        <Box display="flex" marginTop={2}>
          <UnstoppableMessaging />
          <Button variant="contained" onClick={handleOpenChat}>
            {isChatReady ? `Open chat with ${myFriendDomain}` : 'Setup chat'}
          </Button>
        </Box>
        <Box marginTop={5}>
          <Typography variant="h6">Example code</Typography>
          <CodeBlock
            text={exampleCode}
            language="typescript"
            showLineNumbers={true}
            theme={dracula}
          />
        </Box>
      </Paper>
    </>
  );
};

export default UnstoppableMessagingDemo;
