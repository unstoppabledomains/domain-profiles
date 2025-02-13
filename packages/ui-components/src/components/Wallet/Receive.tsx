import CheckIcon from '@mui/icons-material/Check';
import CopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import Markdown from 'markdown-to-jsx';
import React, {useEffect, useRef, useState} from 'react';
import {QRCode} from 'react-qrcode-logo';
import truncateMiddle from 'truncate-middle';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import type {SerializedWalletBalance, TokenEntry} from '../../lib';
import {notifyEvent, useTranslationContext} from '../../lib';
import {getBlockchainDisplaySymbol} from '../Manage/common/verification/types';
import {SelectAsset} from './SelectAsset';
import {TitleWithBackButton} from './TitleWithBackButton';

const useStyles = makeStyles()((theme: Theme) => ({
  flexColCenterAligned: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  qrContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    backgroundColor: theme.palette.common.white,
    padding: theme.spacing(2),
  },
  descriptionText: {
    color: theme.palette.wallet.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing(3),
  },
  infoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    width: '325px',
    height: '100%',
  },
  infoTable: {
    marginTop: theme.spacing(2),
    width: '100%',
  },
  infoData: {
    color: theme.palette.wallet.text.primary,
    textAlign: 'right',
  },
  infoHeader: {
    color: theme.palette.wallet.text.secondary,
    textAlign: 'left',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  button: {
    marginBottom: theme.spacing(1),
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
  const theme = useTheme();
  const [selectedToken, setSelectedToken] = useState<TokenEntry>();
  const [copied, setCopied] = useState<boolean>(false);
  const {classes} = useStyles();
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
          hideBalance={true}
          bannerType="receive"
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

  const handleShareClick = async () => {
    try {
      await navigator.share({
        title: theme.wallet.title,
        text: t('wallet.shareAddress', {
          address: selectedToken.walletAddress,
          network: selectedToken.walletName,
        }),
      });
    } catch (e) {
      notifyEvent(e, 'error', 'Wallet', 'Configuration');
    }
  };

  return (
    <Box className={classes.flexColCenterAligned}>
      <TitleWithBackButton
        onCancelClick={handleBackClick}
        label={t('wallet.actionOnBlockchainTitle', {
          action: t('common.receive'),
          symbol: '',
          blockchain: selectedToken.walletName,
        })}
      />
      <Box className={classes.infoContainer}>
        <Typography variant="body2" className={classes.descriptionText}>
          <Markdown>
            {t('wallet.receiveAddressCaption', {
              symbol: getBlockchainDisplaySymbol(selectedToken.ticker),
              blockchain: selectedToken.walletName,
            })}
          </Markdown>
        </Typography>
        <Box className={classes.qrContainer}>
          <QRCode
            value={selectedToken.walletAddress}
            size={175}
            qrStyle={'dots'}
            ecLevel={'H'}
            eyeRadius={5}
            logoPadding={5}
            logoImage={selectedToken.imageUrl}
            logoPaddingStyle="square"
            removeQrCodeBehindLogo={true}
            quietZone={0}
          />
        </Box>
        <Grid container spacing={1} className={classes.infoTable}>
          <Grid item xs={6} className={classes.infoHeader}>
            <Typography>{t('common.network')}</Typography>
          </Grid>
          <Grid item xs={6} className={classes.infoData}>
            <Typography fontWeight="bold">
              {selectedToken.walletName}
            </Typography>
          </Grid>
          <Grid item xs={6} className={classes.infoHeader}>
            <Typography>{t('common.address')}</Typography>
          </Grid>
          <Grid item xs={6} className={classes.infoData}>
            <Typography fontWeight="bold">
              {truncateMiddle(selectedToken.walletAddress, 6, 6, '...')}
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <Box className={classes.buttonContainer}>
        <Button
          className={classes.button}
          startIcon={<ShareIcon />}
          onClick={handleShareClick}
          variant="outlined"
          fullWidth
        >
          {t('profile.share')}
        </Button>
        <Button
          className={classes.button}
          startIcon={copied ? <CheckIcon /> : <CopyIcon />}
          onClick={handleCopyClick}
          variant="contained"
          fullWidth
        >
          {t('profile.copyAddress')}
        </Button>
      </Box>
    </Box>
  );
};

export default Receive;
