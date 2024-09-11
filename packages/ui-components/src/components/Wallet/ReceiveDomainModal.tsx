import CheckIcon from '@mui/icons-material/CheckCircle';
import CopyIcon from '@mui/icons-material/ContentCopy';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import Markdown from 'markdown-to-jsx';
import React, {useRef, useState} from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useFireblocksState} from '../../hooks';
import {useTranslationContext} from '../../lib';
import {getBootstrapState} from '../../lib/fireBlocks/storage/state';
import {isEthAddress} from '../Chat/protocol/resolution';
import ManageInput from '../Manage/common/ManageInput';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '450px',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  button: {
    marginTop: theme.spacing(3),
  },
}));

type Props = {
  onReceiveClicked?: () => void;
  onBuyClicked?: () => void;
};

const ReceiveDomainModal: React.FC<Props> = ({
  onReceiveClicked,
  onBuyClicked,
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const [state] = useFireblocksState();
  const walletState = getBootstrapState(state);
  const [copied, setCopied] = useState<boolean>(false);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // retrieve EVM address to receive domain
  const address = walletState?.assets.find(a =>
    isEthAddress(a.address),
  )?.address;

  // show loading spinner until address is available
  if (!address) {
    return (
      <Box display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  const handleBuyDomain = () => {
    window.open(`${config.UNSTOPPABLE_WEBSITE_URL}/search`, '_blank');
  };

  const handleCopyClick = () => {
    void navigator.clipboard.writeText(address);
    setCopied(true);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return (
    <Box className={classes.container}>
      <Typography variant="body1" mb={1}>
        {t('wallet.addDomainDescription')}
      </Typography>
      <Typography variant="body2" mb={1} component="div">
        <Markdown>{t('wallet.addDomainInstructions')}</Markdown>
      </Typography>
      <Box>
        <ManageInput
          placeholder=""
          onChange={() => null}
          id="receive"
          value={address}
          stacked={true}
          disabled
          multiline
          endAdornment={
            <Button onClick={handleCopyClick}>
              {copied ? <CheckIcon color="success" /> : <CopyIcon />}
            </Button>
          }
        />
      </Box>
      <Button
        variant="contained"
        fullWidth
        onClick={onBuyClicked || handleBuyDomain}
        className={classes.button}
      >
        {t('wallet.addDomainBuy')}
      </Button>
    </Box>
  );
};

export default ReceiveDomainModal;
