import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import CheckIcon from '@mui/icons-material/CheckCircle';
import CopyIcon from '@mui/icons-material/ContentCopy';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useState} from 'react';
import {QRCode} from 'react-qrcode-logo';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import type {SerializedWalletBalance} from '../../../../lib';
import {useTranslationContext} from '../../../../lib';
import type {TokenEntry} from '../../../Wallet/Token';
import ManageInput from '../../common/ManageInput';
import {SelectAsset} from './SelectAsset';

const useStyles = makeStyles()((theme: Theme) => ({
  flexColCenterAligned: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  selectAssetContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '250px',
    width: '400px',
    justifyContent: 'space-between',
  },
  assetsContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    alignItems: 'center',
  },
  asset: {
    backgroundImage: 'linear-gradient(#0655DD, #043893)',
    borderRadius: 9,
    padding: 12,
    width: '100%',
  },
  assetLogo: {
    height: '80px',
    width: '80px',
    marginTop: '5px',
  },
  contentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '250px',
    width: '400px',
  },
  receiveAssetContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  receiveContentContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  copyButton: {},
  addressWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  captionContainer: {
    display: 'flex',
    alignItems: 'center',
  },
}));

type Props = {
  onCancelClick: () => void;
  wallets: SerializedWalletBalance[];
};

const Receive: React.FC<Props> = ({onCancelClick, wallets}) => {
  const [t] = useTranslationContext();
  const [asset, setAsset] = useState<TokenEntry>();
  const [copied, setCopied] = useState<boolean>(false);
  const {classes} = useStyles();

  const handleBackClick = () => {
    if (asset) {
      setAsset(undefined);
    } else {
      onCancelClick();
    }
  };

  if (!asset) {
    return (
      <Box className={classes.flexColCenterAligned}>
        <Box className={classes.fullWidth}>
          <Button onClick={handleBackClick} data-testid={'back-button'}>
            <ArrowBackOutlinedIcon />
          </Button>
        </Box>
        <SelectAsset
          onSelectAsset={setAsset}
          wallets={wallets}
          onCancelClick={handleBackClick}
          label={t('wallet.selectAssetToReceive')}
        />
      </Box>
    );
  }

  const handleCopyClick = () => {
    void navigator.clipboard.writeText(asset.walletAddress);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return (
    <Box className={classes.flexColCenterAligned}>
      <Box className={classes.fullWidth}>
        <Button onClick={handleBackClick}>
          <ArrowBackOutlinedIcon />
        </Button>
      </Box>
      <Box className={classes.contentWrapper}>
        <Box className={classes.receiveContentContainer}>
          <Box className={classes.receiveAssetContainer} mb={2}>
            <Typography variant="h5" className={classes.fullWidth}>
              Receive {asset.symbol}
            </Typography>
            <img src={asset.imageUrl} className={classes.assetLogo} />
          </Box>
          <QRCode
            value={`${asset.name}:${asset.walletAddress}`}
            size={110}
            logoOpacity={0.5}
            logoHeight={60}
            logoWidth={60}
            qrStyle={'dots'}
            ecLevel={'H'}
            eyeRadius={5}
            style={{innerHeight: 80, innerWidth: 30}}
          />
          <Box className={classes.addressWrapper} mt={2}>
            <ManageInput
              placeholder=""
              onChange={() => null}
              id="amount"
              value={asset.walletAddress}
              stacked={true}
              disabled
              endAdornment={
                <Button
                  onClick={handleCopyClick}
                  className={classes.copyButton}
                >
                  {copied ? <CheckIcon color="success" /> : <CopyIcon />}
                </Button>
              }
            />
            <Box mt={1} className={classes.captionContainer}>
              <Typography variant="caption">
                This address can only be used to receive compatible tokens
              </Typography>
            </Box>
          </Box>
          <Box display="flex" mt={2} className={classes.fullWidth}>
            <Button fullWidth onClick={onCancelClick} variant="outlined">
              {t('common.cancel')}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Receive;
