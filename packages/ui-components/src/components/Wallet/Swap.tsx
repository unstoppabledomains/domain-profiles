import type {IFireblocksNCW} from '@fireblocks/ncw-js-sdk';
import Alert from '@mui/lab/Alert';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getSwapQuote, getSwapToken} from '../../actions/swapActions';
import type {SerializedWalletBalance} from '../../lib';
import {TokenType, useTranslationContext} from '../../lib';
import {SwingQuote} from '../../lib/types/swingXyz';
import {
  getBlockchainDisplaySymbol,
  getBlockchainName,
} from '../Manage/common/verification/types';
import FundWalletModal from './FundWalletModal';
import {TitleWithBackButton} from './TitleWithBackButton';
import type {TokenEntry} from './Token';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  },
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
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  noTokensContainer: {
    textAlign: 'center',
    height: '100%',
  },
  description: {
    textAlign: 'left',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4),
  },
  dropDown: {
    width: '100%',
    marginBottom: theme.spacing(3),
  },
  button: {
    marginBottom: theme.spacing(1),
  },
}));

type Props = {
  onCancelClick: () => void;
  onClickReceive?: () => void;
  onClickBuy?: () => void;
  getClient: () => Promise<IFireblocksNCW>;
  accessToken: string;
  wallets: SerializedWalletBalance[];
  supportErc20?: boolean;
};

const Swap: React.FC<Props> = ({
  onCancelClick,
  onClickBuy,
  onClickReceive,
  getClient,
  accessToken,
  wallets,
  supportErc20,
}) => {
  const [t] = useTranslationContext();
  const {classes} = useStyles();
  const [isGettingQuote, setIsGettingQuote] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [amtUsdStr, setAmtUsdStr] = useState('100');
  const [sourceToken, setSourceToken] = useState<TokenEntry>();
  const [destinationToken, setDestinationToken] = useState<TokenEntry>();
  const [quotes, setQuotes] = useState<SwingQuote[]>();
  const isDisabled =
    !!errorMessage ||
    !sourceToken ||
    !destinationToken ||
    !amtUsdStr ||
    !quotes ||
    quotes.length === 0;

  useEffect(() => {
    if (!sourceToken || !destinationToken) {
      return;
    }
    void handleGetQuote();
  }, [sourceToken, destinationToken]);

  const handleSourceChange = (event: SelectChangeEvent) => {
    setErrorMessage(undefined);
    setSourceToken(filteredTokens.find(v => v.symbol === event.target.value));
  };

  const handleDestinationChange = async (event: SelectChangeEvent) => {
    setQuotes(undefined);
    setIsGettingQuote(true);
    setErrorMessage(undefined);
    setDestinationToken(allTokens.find(v => v.symbol === event.target.value));
  };

  const handleGetQuote = async () => {
    // validate parameters
    if (!sourceToken || !destinationToken) {
      setErrorMessage('Choose tokens to swap');
      return;
    }

    // retrieve source token
    const swapToken = await getSwapToken(
      getBlockchainName(sourceToken.symbol).toLowerCase(),
      getBlockchainDisplaySymbol(sourceToken.symbol),
    );
    if (!swapToken) {
      setErrorMessage('Error retrieving token details');
      return;
    }

    // determine amount based on market price and token decimals
    const amountInDecimals = Math.floor(
      (parseFloat(amtUsdStr) / swapToken.price) *
        Math.pow(10, swapToken.decimals),
    );

    // retrieve the quote
    setIsGettingQuote(true);
    setErrorMessage(undefined);
    const quotesResponse = await getSwapQuote({
      type: 'swap',
      source: {
        chain: getBlockchainName(sourceToken.symbol).toLowerCase(),
        token: getBlockchainDisplaySymbol(sourceToken.ticker),
        wallet: sourceToken.walletAddress,
        amount: String(amountInDecimals),
      },
      destination: {
        chain: getBlockchainName(destinationToken.symbol).toLowerCase(),
        token: getBlockchainDisplaySymbol(destinationToken.ticker),
        wallet: destinationToken.walletAddress,
      },
    });
    setIsGettingQuote(false);

    // validate result
    if (!quotesResponse || quotesResponse.length === 0) {
      setErrorMessage('Unable to find quote');
      return;
    }

    // store quotes sorted by time
    setQuotes(quotesResponse.sort((a, b) => a.duration - b.duration));
  };

  const getQuoteDescription = (q: SwingQuote) => {
    const quoteFee =
      parseFloat(q.fees.bridge.amountUSD) +
      parseFloat(q.fees.gas.amountUSD) +
      parseFloat(q.fees.partner.amountUSD);
    return `${quoteFee.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    })} fee / ${q.duration} minute${q.duration > 1 ? 's' : ''}`;
  };

  const serializeNativeTokens = (wallet: SerializedWalletBalance) => {
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
      tokenConversionUsd: wallet.value?.marketUsdAmt || 0,
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
  };
  const allTokens: TokenEntry[] = [
    ...wallets.flatMap(serializeNativeTokens),
    ...(wallets || []).flatMap(wallet =>
      (wallet?.tokens || []).map(walletToken => {
        return {
          address: walletToken.address,
          type: walletToken.type,
          name: walletToken.name,
          value: walletToken.value?.walletUsdAmt || 0,
          balance: walletToken.balanceAmt || 0,
          pctChange: walletToken.value?.marketPctChange24Hr,
          tokenConversionUsd: walletToken.value?.marketUsdAmt || 0,
          history: walletToken.value?.history?.sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
          ),
          ticker: walletToken.symbol,
          symbol: wallet.symbol,
          walletAddress: wallet.address,
          walletBlockChainLink: wallet.blockchainScanUrl,
          walletName: wallet.name,
          walletType: wallet.walletType,
          imageUrl: walletToken.logoUrl,
        };
      }),
    ),
  ]
    .filter(
      token =>
        (supportErc20 && token.type === TokenType.Erc20) ||
        config.WALLETS.CHAINS.SWAP.includes(
          `${token.symbol.toUpperCase()}/${token.ticker.toUpperCase()}`,
        ),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  const filteredTokens: TokenEntry[] = allTokens
    .filter(token => token.balance > 0)
    .sort((a, b) => b.value - a.value || b.balance - a.balance);

  return (
    <Box className={classes.flexColCenterAligned}>
      <TitleWithBackButton
        onCancelClick={onCancelClick}
        label={t('swap.description')}
      />
      <Box className={classes.container}>
        <Box className={classes.content}>
          {allTokens.length > 0 &&
            filteredTokens.length === 0 &&
            onClickBuy &&
            onClickReceive && (
              <Box className={classes.noTokensContainer}>
                <FundWalletModal
                  onBuyClicked={onClickBuy}
                  onReceiveClicked={onClickReceive}
                />
              </Box>
            )}
          <Alert severity="info" className={classes.description}>
            Swapping allows you to convert from one crypto token to another.
          </Alert>
          <FormControl
            className={classes.dropDown}
            disabled={isGettingQuote || isSwapping}
          >
            <InputLabel id="source-token-label">
              Select source crypto
            </InputLabel>
            <Select
              labelId="source-token-label"
              id="source-token"
              value={sourceToken?.symbol}
              label="Select source crypto"
              onChange={handleSourceChange}
            >
              {filteredTokens.map(v => (
                <MenuItem value={v.symbol}>
                  {getBlockchainDisplaySymbol(v.ticker)} on {v.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              Convert this token to something else
            </FormHelperText>
          </FormControl>
          <FormControl
            className={classes.dropDown}
            disabled={!sourceToken || isGettingQuote || isSwapping}
          >
            <InputLabel id="destination-token-label">
              Select destination crypto
            </InputLabel>
            <Select
              labelId="destination-token-label"
              id="destination-token"
              value={destinationToken?.symbol}
              label="Select destination crypto"
              onChange={handleDestinationChange}
            >
              {allTokens
                .filter(v => v.symbol !== sourceToken?.symbol)
                .map(v => (
                  <MenuItem value={v.symbol}>
                    {getBlockchainDisplaySymbol(v.ticker)} on {v.name}
                  </MenuItem>
                ))}
            </Select>
            <FormHelperText>The token you want to end up with</FormHelperText>
          </FormControl>
        </Box>
        <LoadingButton
          fullWidth
          variant="contained"
          onClick={handleGetQuote}
          disabled={isDisabled}
          className={classes.button}
          loading={isGettingQuote || isSwapping}
          loadingIndicator={
            <Box display="flex" alignItems="center">
              <CircularProgress color="inherit" size={16} />
              <Box ml={1}>
                {isSwapping
                  ? 'Swapping...'
                  : isGettingQuote
                  ? 'Getting quote...'
                  : ''}
              </Box>
            </Box>
          }
        >
          <Box className={classes.content}>
            <Typography variant="body1" fontWeight="bold">
              {errorMessage
                ? errorMessage
                : isDisabled
                ? 'Select tokens to swap'
                : `Swap ${parseFloat(amtUsdStr)
                    .toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })
                    .replace('.00', '')} ${getBlockchainDisplaySymbol(
                    sourceToken.ticker,
                  )} to ${getBlockchainDisplaySymbol(destinationToken.ticker)}`}
            </Typography>
            {quotes && (
              <Typography variant="caption">
                {getQuoteDescription(quotes[0])}
              </Typography>
            )}
          </Box>
        </LoadingButton>
      </Box>
    </Box>
  );
};

export default Swap;
