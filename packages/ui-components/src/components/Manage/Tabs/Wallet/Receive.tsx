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
import {TokenType, useTranslationContext} from '../../../../lib';
import type {TokenEntry} from '../../../Wallet/Token';
import Token from '../../../Wallet/Token';
import ManageInput from '../../common/ManageInput';

const useStyles = makeStyles()((theme: Theme) => ({
  fullWidth: {
    width: '100%',
  },
  selectAssetContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '250px',
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
    height: '40px',
    width: '40px',
    marginTop: '5px',
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
    width: '100%',
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

export const Receive: React.FC<Props> = ({onCancelClick, wallets}) => {
  const [t] = useTranslationContext();
  const [asset, setAsset] = useState<TokenEntry>();
  const [copied, setCopied] = useState<boolean>(false);
  const {classes} = useStyles();

  // serialize native tokens
  const nativeTokens: TokenEntry[] = [
    ...(wallets || []).flatMap(wallet => ({
      type: TokenType.Native,
      name: wallet.name,
      value: wallet.value?.walletUsdAmt || 0,
      balance: wallet.balanceAmt || 0,
      pctChange: wallet.value?.marketPctChange24Hr,
      history: [],
      symbol: wallet.symbol,
      ticker: wallet.gasCurrency,
      walletAddress: wallet.address,
      walletBlockChainLink: wallet.blockchainScanUrl,
      walletName: wallet.name,
      imageUrl: wallet.logoUrl,
    })),
  ].sort((a, b) => b.value - a.value);

  if (!asset) {
    return (
      <Box className={classes.selectAssetContainer}>
        <Box className={classes.fullWidth}>
          <Typography variant="h5">
            {t('wallet.selectAssetToReceive')}
          </Typography>
        </Box>
        <Box className={classes.assetsContainer} mt={2}>
          {nativeTokens.map(token => {
            const handleClick = () => {
              setAsset(token);
            };
            return (
              <div className={classes.asset}>
                <Token primaryShade token={token} onClick={handleClick} />
              </div>
            );
          })}
        </Box>
        <Box className={classes.fullWidth} mt={2}>
          <Button fullWidth onClick={onCancelClick} variant="outlined">
            {t('common.cancel')}
          </Button>
        </Box>
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
    <>
      <Box className={classes.receiveAssetContainer}>
        <Typography variant="h5">Receive {asset.symbol}</Typography>
        {/* <img src={asset.imageUrl} className={classes.assetLogo} /> */}
      </Box>
      <Box className={classes.receiveContentContainer}>
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
              <Button onClick={handleCopyClick} className={classes.copyButton}>
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
      </Box>
      <Box display="flex" mt={2} className={classes.fullWidth}>
        <Button fullWidth onClick={onCancelClick} variant="outlined">
          {t('common.cancel')}
        </Button>
      </Box>
    </>
  );
};
