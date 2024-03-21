import WalletOutlinedIcon from '@mui/icons-material/WalletOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import Markdown from 'markdown-to-jsx';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useTranslationContext} from '../../../../lib';
import {TabHeader} from '../../common/TabHeader';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  messageContainer: {
    backgroundColor: theme.palette.neutralShades[100],
    border: `1px solid ${theme.palette.neutralShades[400]}`,
    borderRadius: theme.shape.borderRadius,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(1),
    marginLeft: '1px',
    marginRight: '1px',
    fontFamily: 'monospace',
    fontSize: '12px',
    wordWrap: 'break-word',
    maxWidth: '500px',
    textAlign: 'left',
  },
  button: {
    marginTop: theme.spacing(1),
  },
}));

export const Signer: React.FC<SignerProps> = ({message, onSuccess}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();

  const handleSignature = () => {
    onSuccess('fake signature');
  };

  const handleReject = () => {
    onSuccess('');
  };

  return (
    <Box className={classes.container}>
      <Box display="flex" flexDirection="column" height="100%">
        <TabHeader
          icon={<WalletOutlinedIcon />}
          description={t('manage.cryptoWalletDescription')}
          learnMoreLink="https://support.unstoppabledomains.com/support/solutions/articles/48001205861-list-domain-for-sale-on-our-website"
        />
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          alignContent="center"
          justifyContent="center"
          textAlign="center"
        >
          <Typography variant="h4">{t('wallet.signMessage')}</Typography>
          <Typography mt={3} variant="body2">
            {t('wallet.signMessageDescription')}
          </Typography>
          <Typography mt={3} variant="body1">
            {t('wallet.signMessageSubtitle')}:
          </Typography>
          <Box className={classes.messageContainer}>
            <Markdown>{message}</Markdown>
          </Box>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column">
        <Button
          className={classes.button}
          fullWidth
          variant="contained"
          onClick={handleSignature}
        >
          {t('wallet.approve')}
        </Button>
        <Button
          className={classes.button}
          fullWidth
          variant="outlined"
          onClick={handleReject}
        >
          {t('wallet.reject')}
        </Button>
      </Box>
    </Box>
  );
};

export interface SignerProps {
  message: string;
  onSuccess: (signedMessage: string) => void;
}
