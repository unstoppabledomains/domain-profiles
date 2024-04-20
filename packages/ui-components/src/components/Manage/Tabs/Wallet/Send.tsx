import type {IFireblocksNCW} from '@fireblocks/ncw-js-sdk';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {sendCrypto} from '../../../../actions/fireBlocksActions';
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
    maxWidth: '350px',
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
  maxButton: {},
}));

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
  const [recipientDomainOrAddress, setRecipientDomainOrAddress] = useState('');
  const [asset, setAsset] = useState<TokenEntry>();
  const [amount, setAmount] = useState('');
  const [successfulTxId, setSuccessfulTxId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {classes} = useStyles();

  const handleSendCrypto = async () => {
    setIsLoading(true);

    const sourceAddress = asset?.walletAddress;
    const sourceSymbol = asset?.symbol;
    if (!sourceAddress || !sourceSymbol) {
      return;
    }
    const txId = await sendCrypto(
      accessToken,
      sourceAddress,
      sourceSymbol,
      recipientDomainOrAddress,
      {
        type: TokenType.Native,
        amount: parseFloat(amount),
      },
      async (internalTxId: string) => {
        await client.signTransaction(internalTxId);
      },
    );
    setSuccessfulTxId(txId);
    setIsLoading(false);
  };

  const handleMaxClick = () => {
    handleAmountChange('amount', asset?.balance.toString() || '');
  };

  const handleRecipientChange = (id: string, value: string) => {
    setRecipientDomainOrAddress(value);
  };

  const handleAmountChange = (id: string, value: string) => {
    const numberValue = Number(value);
    if ((isNaN(numberValue) || numberValue < 0) && value !== '.') {
      return;
    }
    setAmount(value);
  };

  const canSend = () => {
    return (
      recipientDomainOrAddress &&
      amount &&
      asset?.walletAddress &&
      asset?.symbol
    );
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  // serialize native tokens
  const nativeTokens: TokenEntry[] = [
    ...(wallets || []).flatMap(wallet => {
      if (
        wallet.value?.history &&
        wallet.value.history.length > 0 &&
        wallet.value.history[wallet.value.history.length - 1].value !==
          wallet.value.marketUsdAmt
      ) {
        wallet.value.history.push({
          timestamp: new Date(),
          value: wallet.value.marketUsdAmt || 0,
        });
      }
      return {
        type: TokenType.Native,
        name: wallet.name,
        value: wallet.value?.walletUsdAmt || 0,
        balance: wallet.balanceAmt || 0,
        pctChange: wallet.value?.marketPctChange24Hr,
        history: wallet.value?.history?.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        ),
        symbol: wallet.symbol,
        ticker: wallet.gasCurrency,
        walletAddress: wallet.address,
        walletBlockChainLink: wallet.blockchainScanUrl,
        walletName: wallet.name,
        imageUrl: wallet.logoUrl,
      };
    }),
  ]
    .filter(item => item?.value > 0.01)
    .sort((a, b) => b.value - a.value);

  if (successfulTxId) {
    return (
      <>
        <Typography variant="h3">{t('common.success')}</Typography>
        <Typography variant="body1">
          {t('wallet.transactionId', {id: successfulTxId})}
        </Typography>
      </>
    );
  }

  if (!asset) {
    return (
      <div className={classes.selectAssetContainer}>
        <div className={classes.fullWidth}>
          <Typography variant="h5">{t('wallet.selectAsset')}</Typography>
        </div>
        <div className={classes.assetsContainer}>
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
        </div>
        <Button fullWidth onClick={onCancelClick} variant="outlined">
          {t('common.cancel')}
        </Button>
      </div>
    );
  }
  const insufficientBalanceError = parseFloat(amount) > asset.balance;
  return (
    <>
      <Box className={classes.sendAssetContainer}>
        <Typography variant="h5">Send {asset.symbol}</Typography>
        <img src={asset.imageUrl} className={classes.assetLogo} />
      </Box>
      <ManageInput
        id="recipientDomainOrAddress"
        value={recipientDomainOrAddress}
        label={'Recipient'}
        placeholder={'Recipient domain or address'}
        onChange={handleRecipientChange}
        stacked={true}
      />
      <Box className={classes.sendAmountContainer}>
        <div className={classes.amountInputWrapper}>
          <ManageInput
            id="amount"
            value={amount}
            label={'Amount'}
            placeholder={`Amount in ${asset.symbol}`}
            onChange={handleAmountChange}
            stacked={true}
            error={insufficientBalanceError}
            errorText={insufficientBalanceError ? 'Insufficient balance' : ''}
            endAdornment={
              <Button onClick={handleMaxClick} className={classes.maxButton}>
                Max
              </Button>
            }
          />
        </div>
        {insufficientBalanceError ? null : (
          <Typography variant="subtitle1" className={classes.availableBalance}>
            Available: {asset.balance.toFixed(5)} {asset.symbol}
          </Typography>
        )}
      </Box>
      <Box display="flex" mt={1}>
        <Button
          fullWidth
          onClick={handleSendCrypto}
          disabled={!canSend()}
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
