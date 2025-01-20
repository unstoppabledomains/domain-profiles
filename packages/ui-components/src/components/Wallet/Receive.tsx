import CheckIcon from '@mui/icons-material/CheckCircle';
import CopyIcon from '@mui/icons-material/ContentCopy';
// eslint-disable-next-line no-restricted-imports
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import Markdown from 'markdown-to-jsx';
import React, {useEffect, useRef, useState} from 'react';
import {QRCode} from 'react-qrcode-logo';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {CryptoIcon} from '../../components/Image/CryptoIcon';
import type {SerializedWalletBalance, TokenEntry} from '../../lib';
import {useTranslationContext} from '../../lib';
import ManageInput from '../Manage/common/ManageInput';
import {getBlockchainDisplaySymbol} from '../Manage/common/verification/types';
import {SelectAsset} from './SelectAsset';
import {TitleWithBackButton} from './TitleWithBackButton';

const useStyles = makeStyles()((theme: Theme) => ({
  flexColCenterAligned: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    [theme.breakpoints.down('sm')]: {
      width: '346px',
      marginLeft: theme.spacing(-1),
      marginRight: theme.spacing(-1),
    },
    height: '100%',
    justifyContent: 'space-between',
  },
  contentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  inputIcon: {
    width: '40px',
    height: '40px',
  },
  currencyIcon: {
    marginLeft: theme.spacing(2),
  },
  alertContainer: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  addressWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  input: {
    fontSize: '12px',
  },
  infoIcon: {
    fontSize: 15,
  },
  flex: {
    display: 'flex',
  },
}));

type Props = {
  onCancelClick: () => void;
  wallets: SerializedWalletBalance[];
  initialSelectedToken?: TokenEntry;
};

const Receive: React.FC<Props> = ({
  onCancelClick,
  wallets,
  initialSelectedToken,
}) => {
  const [t] = useTranslationContext();
  const [selectedToken, setSelectedToken] = useState<TokenEntry>();
  const [copied, setCopied] = useState<boolean>(false);
  const {classes, cx} = useStyles();
  const debounceTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!initialSelectedToken) {
      return;
    }
    handleSelectToken(initialSelectedToken);
  }, [initialSelectedToken]);

  const handleSelectToken = (token: TokenEntry) => {
    setSelectedToken(token);
  };

  const handleBackClick = () => {
    if (selectedToken && !initialSelectedToken) {
      setSelectedToken(undefined);
    } else {
      onCancelClick();
    }
  };

  if (!selectedToken) {
    return (
      <Box className={classes.flexColCenterAligned}>
        <SelectAsset
          onSelectAsset={handleSelectToken}
          wallets={wallets}
          onCancelClick={handleBackClick}
          label={t('wallet.selectAssetToReceive')}
          supportedAssetList={config.WALLETS.CHAINS.RECEIVE}
        />
      </Box>
    );
  }

  const handleCopyClick = () => {
    void navigator.clipboard.writeText(selectedToken.walletAddress);
    setCopied(true);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return (
    <Box className={classes.flexColCenterAligned}>
      <TitleWithBackButton
        onCancelClick={handleBackClick}
        label={t('wallet.actionOnBlockchainTitle', {
          action: t('common.receive'),
          symbol: getBlockchainDisplaySymbol(selectedToken.ticker),
          blockchain: selectedToken.walletName,
        })}
      />
      <Box className={classes.contentWrapper}>
        <QRCode
          value={`${selectedToken.walletName}:${selectedToken.walletAddress}`}
          size={200}
          qrStyle={'dots'}
          ecLevel={'H'}
          eyeRadius={5}
          style={{innerHeight: 80, innerWidth: 30}}
        />
      </Box>
      <Box className={classes.addressWrapper}>
        <ManageInput
          placeholder=""
          onClick={handleCopyClick}
          onChange={() => null}
          id="amount"
          value={selectedToken.walletAddress}
          stacked={true}
          disabled
          multiline
          classes={{input: classes.input}}
          startAdornment={
            <CryptoIcon
              currency={getBlockchainDisplaySymbol(selectedToken.ticker)}
              className={cx(classes.inputIcon, classes.currencyIcon)}
            />
          }
          endAdornment={
            <Button onClick={handleCopyClick} className={classes.inputIcon}>
              {copied ? <CheckIcon color="success" /> : <CopyIcon />}
            </Button>
          }
        />
      </Box>
      <Alert
        variant="standard"
        severity="warning"
        className={classes.alertContainer}
      >
        <Typography variant="caption">
          <Markdown>
            {t(
              config.WALLETS.CHAINS.DOMAINS.map(s => s.toLowerCase()).includes(
                selectedToken.symbol.toLowerCase(),
              )
                ? 'wallet.receiveAddressCaptionWithDomains'
                : 'wallet.receiveAddressCaption',
              {
                symbol: getBlockchainDisplaySymbol(selectedToken.ticker),
                blockchain: selectedToken.walletName,
              },
            )}
          </Markdown>{' '}
          {t('wallet.sendingForOtherNetworksAndTokens', {
            symbol: getBlockchainDisplaySymbol(selectedToken.ticker),
            blockchain: selectedToken.walletName,
          })}
        </Typography>
      </Alert>
    </Box>
  );
};

export default Receive;
