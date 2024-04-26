import type {IFireblocksNCW} from '@fireblocks/ncw-js-sdk';
import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useState} from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {sendCrypto} from '../../../../actions/fireBlocksActions';
import type {SerializedWalletBalance} from '../../../../lib';
import {TokenType, useTranslationContext} from '../../../../lib';
import Link from '../../../Link';
import type {TokenEntry} from '../../../Wallet/Token';
import Token from '../../../Wallet/Token';
import ManageInput from '../../common/ManageInput';
import AddressInput from './AddressInput';

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
    height: '80px',
    width: '80px',
    marginTop: '10px',
  },
  sendAssetContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  sendAmountContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '113px',
  },
  recipientWrapper: {
    height: '109px',
  },
  amountInputWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  availableBalance: {
    textAlign: 'right',
    fontSize: '13px',
    marginTop: '2px',
  },
  sendLoadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  transactionStatusContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '7px',
    height: '155px',
  },
  icon: {
    fontSize: '60px',
  },
}));

const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

type Props = {
  onCancelClick: () => void;
  client: IFireblocksNCW;
  accessToken: string;
  wallets: SerializedWalletBalance[];
};

export const Send: React.FC<Props> = ({
  onCancelClick,
  client,
  accessToken,
  wallets,
}) => {
  const [t] = useTranslationContext();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [asset, setAsset] = useState<TokenEntry>();
  const [amount, setAmount] = useState('');
  const [transactionSubmitted, setTransactionSubmitted] = useState(false);
  const [resolvedDomain, setResolvedDomain] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendStatus, setSendStatus] = useState('');
  const [sendError, setSendError] = useState(false);
  const {classes} = useStyles();

  const handleSendCrypto = async () => {
    setTransactionSubmitted(true);

    const sourceAddress = asset?.walletAddress;
    const sourceSymbol = asset?.symbol;
    if (!sourceAddress || !sourceSymbol) {
      return;
    }
    try {
      await sendCrypto(
        accessToken,
        sourceAddress,
        sourceSymbol,
        recipientAddress,
        {
          type: TokenType.Native,
          amount: parseFloat(amount),
        },
        async (internalTxId: string) => {
          await client.signTransaction(internalTxId);
        },
        {
          onTxId: (txId: string) => {
            setTransactionId(txId);
          },
          onStatusChange: setSendStatus,
        },
      );
      setSendSuccess(true);
    } catch (e) {
      setSendError(true);
    }
  };

  const handleRecipientChange = (value: string) => {
    setRecipientAddress(value);
  };

  const handleResolvedDomainChange = (value: string) => {
    setResolvedDomain(value);
  };

  const handleMaxClick = () => {
    handleAmountChange('amount', asset?.balance.toString() || '');
  };

  const handleAmountChange = (id: string, value: string) => {
    const numberValue = Number(value);
    if ((isNaN(numberValue) || numberValue < 0) && value !== '.') {
      return;
    }
    setAmount(value);
  };

  const canSend = () => {
    return recipientAddress && amount && asset?.walletAddress && asset?.symbol;
  };

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
          <Typography variant="h5">{t('wallet.selectAssetToSend')}</Typography>
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

  if (transactionSubmitted) {
    return (
      <Box className={classes.sendLoadingContainer}>
        {sendSuccess ? (
          <CheckIcon color="success" className={classes.icon} />
        ) : sendError ? (
          <ErrorIcon color="error" className={classes.icon} />
        ) : (
          <CircularProgress />
        )}
        <Box className={classes.transactionStatusContainer} mt={2}>
          <Typography variant="h5">{sendStatus}</Typography>
          <Typography variant="caption">
            {amount} {asset.symbol}{' '}
            {sendSuccess
              ? 'was successfully sent '
              : sendError
              ? 'failed to send '
              : ''}
            to {resolvedDomain ? resolvedDomain : null} (
            {truncateAddress(recipientAddress)})
          </Typography>
          {transactionId && (
            <Link
              variant={'caption'}
              target="_blank"
              href={`${
                config.BLOCKCHAINS[asset.symbol].BLOCK_EXPLORER_TX_URL
              }${transactionId}`}
            >
              {t('wallet.viewTransaction')}
            </Link>
          )}
        </Box>
        <Box display="flex" mt={2} className={classes.fullWidth}>
          <Button fullWidth onClick={onCancelClick} variant="outlined">
            {t('common.close')}
          </Button>
        </Box>
      </Box>
    );
  }

  const insufficientBalance = parseFloat(amount) > asset.balance;

  return (
    <>
      <Box className={classes.sendAssetContainer}>
        <Typography variant="h5">Send {asset.symbol}</Typography>
        <img src={asset.imageUrl} className={classes.assetLogo} />
      </Box>
      <Box className={classes.recipientWrapper}>
        <AddressInput
          label={'Recipient'}
          placeholder={'Recipient domain or address'}
          onAddressChange={handleRecipientChange}
          onResolvedDomainChange={handleResolvedDomainChange}
          assetSymbol={asset.symbol}
        />
      </Box>
      <Box className={classes.sendAmountContainer}>
        <div className={classes.amountInputWrapper}>
          <ManageInput
            id="amount"
            value={amount}
            label={'Amount'}
            placeholder={`Amount in ${asset.symbol}`}
            onChange={handleAmountChange}
            stacked={true}
            error={insufficientBalance}
            errorText={insufficientBalance ? 'Insufficient balance' : ''}
            endAdornment={<Button onClick={handleMaxClick}>Max</Button>}
          />
        </div>
        {insufficientBalance ? null : (
          <Typography variant="subtitle1" className={classes.availableBalance}>
            Available: {asset.balance.toFixed(5)} {asset.symbol}
          </Typography>
        )}
      </Box>
      <Box display="flex" mt={1}>
        <Button
          fullWidth
          onClick={handleSendCrypto}
          disabled={!canSend() || insufficientBalance}
          variant="contained"
        >
          {t('common.send')}
        </Button>
      </Box>
      <Box display="flex" mt={1}>
        <Button fullWidth onClick={onCancelClick} variant="outlined">
          {t('common.cancel')}
        </Button>
      </Box>
    </>
  );
};
