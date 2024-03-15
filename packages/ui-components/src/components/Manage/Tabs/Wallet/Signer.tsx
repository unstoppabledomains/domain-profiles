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
  },
  messageContainer: {
    backgroundColor: theme.palette.neutralShades[100],
    border: `1px solid ${theme.palette.neutralShades[400]}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1),
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
    marginLeft: '1px',
    marginRight: '1px',
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
      <TabHeader
        icon={<WalletOutlinedIcon />}
        description={t('manage.cryptoWalletDescription')}
        learnMoreLink="https://support.unstoppabledomains.com/support/solutions/articles/48001205861-list-domain-for-sale-on-our-website"
      />
      <Typography variant="h4">{t('wallet.signMessage')}</Typography>
      <Typography variant="body1">
        {t('wallet.signMessageDescription')}
      </Typography>
      <Box className={classes.messageContainer}>
        <Typography variant="body2">
          <Markdown>{message}</Markdown>
        </Typography>
      </Box>
      <Button
        className={classes.button}
        fullWidth
        variant="contained"
        onClick={handleSignature}
      >
        Sign
      </Button>
      <Button
        className={classes.button}
        fullWidth
        variant="outlined"
        onClick={handleReject}
      >
        Reject
      </Button>
    </Box>
  );
};

export interface SignerProps {
  message: string;
  onSuccess: (signedMessage: string) => void;
}
