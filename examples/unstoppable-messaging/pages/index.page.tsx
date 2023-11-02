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

  // Hard coded wallet address. In a real world scenarios this would
  // be retrieved from a wallet connection
  const myAddress = '0xCD0DAdAb45bAF9a06ce1279D1342EcC3F44845af';

  // Open a chat window to a specific user
  const handleOpenChat = () => {
    setOpenChat('lisa.x');
  };

  return (
    <Paper sx={{margin: 5, padding: 5}}>
      <Box display="flex" marginTop={1}>
        <UnstoppableMessaging address={myAddress} />
        <Button variant="contained" onClick={handleOpenChat}>
          Open chat
        </Button>
      </Box>
    </Paper>
  );
};

export default MyPage;
