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
  const [destinationAddress, setDestinationAddress] = useState('');
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
      destinationAddress,
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

  const handleDestinationAddressChange = (id: string, value: string) => {
    setDestinationAddress(value);
  };

  const handleAmountChange = (id: string, value: string) => {
    setAmount(value);
  };

  const canSend = () => {
    return (
      destinationAddress && amount && asset?.walletAddress && asset?.symbol
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
  return (
    <>
      <ManageInput
        id="destinationAddress"
        value={destinationAddress}
        label={'Destination address'}
        placeholder={'Enter destination address'}
        onChange={handleDestinationAddressChange}
        stacked={true}
      />
      <ManageInput
        id="amount"
        value={amount}
        label={'Amount'}
        placeholder={'Enter amount'}
        onChange={handleAmountChange}
        stacked={true}
      />
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
