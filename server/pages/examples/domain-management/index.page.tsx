import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, {useState} from 'react';
import {CodeBlock, dracula} from 'react-code-blocks';

import type {DomainProfileTabType} from '@unstoppabledomains/ui-components';
import {DomainProfileModal} from '@unstoppabledomains/ui-components';

const exampleCode = `import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, {useState} from 'react';

import type {DomainProfileTabType} from '@unstoppabledomains/ui-components';
import {DomainProfileModal} from '@unstoppabledomains/ui-components';

const UnstoppableManagerDemo = () => {
  // Minimal React state
  const [isOpen, setIsOpen] = useState(false);
  const [domain, setDomain] = useState<string>();

  // Open the management dialogue
  const handleManageClick = () => {
    setIsOpen(true);
  };

  // Close the management dialogue
  const handleManageDomainModalClose = async () => {
    setIsOpen(false);
  };

  // Callback after domain update has been saved
  const handleManageDomainModalUpdate = async (
    tab: DomainProfileTabType,
  ): Promise<void> => {
    // do something with the updated data
  };

  return (
    <Paper sx={{margin: 5, padding: 5}}>
      <Box display="flex">
        <Box mr={1}>
          <TextField
            label="Domain name"
            placeholder="e.g. mydomain.x"
            onChange={e => setDomain(e.target.value)}
          />
        </Box>
        <Button
          variant="contained"
          disabled={!domain}
          onClick={handleManageClick}
        >
          Manage
        </Button>
        {domain && isOpen && (
          <DomainProfileModal
            domain={domain}
            open={isOpen}
            onClose={handleManageDomainModalClose}
            onUpdate={handleManageDomainModalUpdate}
          />
        )}
      </Box>
    </Paper>
  )
};`;

const UnstoppableManagerDemo = () => {
  // Minimal React state
  const [isOpen, setIsOpen] = useState(false);
  const [domain, setDomain] = useState<string>();

  // Open the management dialogue
  const handleManageClick = () => {
    setIsOpen(true);
  };

  // Close the management dialogue
  const handleManageDomainModalClose = async () => {
    setIsOpen(false);
  };

  // Callback after domain update has been saved
  const handleManageDomainModalUpdate = async (
    tab: DomainProfileTabType,
  ): Promise<void> => {
    // do something with the updated data
  };

  return (
    <>
      <Box sx={{backgroundColor: '#eeeeee', padding: 3}}>
        <Paper sx={{padding: 5}}>
          <Typography variant="h5">Profile Management Demo</Typography>
          <Box mt={1}>
            <Typography variant="body1">
              Manage your Unstoppable Domain using a React component. Simply
              provide the domain name to manage, and the dialog prompt the user
              to connect the appropriate wallet and collect the signatures
              required to make changes to the domain.
            </Typography>
          </Box>
          <Box display="flex" mt={2}>
            <Box mr={1}>
              <TextField
                label="Domain name"
                placeholder="e.g. mydomain.x"
                onChange={e => setDomain(e.target.value)}
              />
            </Box>
            <Button
              variant="contained"
              disabled={!domain}
              onClick={handleManageClick}
            >
              Manage
            </Button>
            {domain && isOpen && (
              <DomainProfileModal
                domain={domain}
                open={isOpen}
                onClose={handleManageDomainModalClose}
                onUpdate={handleManageDomainModalUpdate}
              />
            )}
          </Box>
          <Box mt={5}>
            <Typography variant="h6">Example code</Typography>
            <Typography variant="body1">
              The full source code for this demo and the included React
              components can be found{' '}
              <a href="https://github.com/unstoppabledomains/domain-profiles/tree/main/examples/domain-management">
                here
              </a>{' '}
              on the official Unstoppable Domains GitHub repo.
            </Typography>
            <Box mt={1}>
              <CodeBlock
                text={exampleCode}
                language="typescript"
                showLineNumbers={true}
                theme={dracula}
              />
            </Box>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default UnstoppableManagerDemo;
