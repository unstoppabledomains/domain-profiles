import type {IFireblocksNCW} from '@fireblocks/ncw-js-sdk';
import Alert from '@mui/lab/Alert';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import type {SelectChangeEvent} from '@mui/material/Select';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import Markdown from 'markdown-to-jsx';
import React, {useEffect, useState} from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getSwapQuote, getSwapToken} from '../../actions/swapActions';
import type {SerializedWalletBalance} from '../../lib';
import {TokenType, useTranslationContext} from '../../lib';
import type {Route} from '../../lib/types/swingXyz';
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
  tokenAmount: {
    color: theme.palette.primary.main,
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
  const [amtUsd, setAmtUsd] = useState('100');
  const [sourceToken, setSourceToken] = useState<TokenEntry>();
  const [sourceTokenDescription, setSourceTokenDescription] =
    useState<string>();
  const [destinationToken, setDestinationToken] = useState<TokenEntry>();
  const [destinationTokenDescription, setDestinationTokenDescription] =
    useState<string>();
  const [quotes, setQuotes] = useState<Route[]>();
  const isDisabled =
    !!errorMessage ||
    !sourceToken ||
    !destinationToken ||
    !amtUsd ||
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
    setSourceToken(sourceTokens.find(v => v.symbol === event.target.value));
    setSourceTokenDescription(undefined);
    setDestinationTokenDescription(undefined);
  };

  const handleDestinationChange = async (event: SelectChangeEvent) => {
    setQuotes(undefined);
    setIsGettingQuote(true);
    setErrorMessage(undefined);
    setDestinationToken(allTokens.find(v => v.symbol === event.target.value));
    setSourceTokenDescription(undefined);
    setDestinationTokenDescription(undefined);
  };

  const handleGetQuote = async () => {
    // validate parameters
    if (!sourceToken || !destinationToken) {
      setErrorMessage('Choose tokens to swap');
      return;
    }

    // reset state
    setIsGettingQuote(true);
    setErrorMessage(undefined);
    setSourceTokenDescription(undefined);
    setDestinationTokenDescription(undefined);

    // retrieve swap token definitions
    const [swapTokenSource, swapTokenDestination] = await Promise.all([
      getSwapToken(
        getBlockchainName(sourceToken.symbol).toLowerCase(),
        getBlockchainDisplaySymbol(sourceToken.ticker),
      ),
      getSwapToken(
        getBlockchainName(destinationToken.symbol).toLowerCase(),
        getBlockchainDisplaySymbol(destinationToken.ticker),
      ),
    ]);
    if (!swapTokenSource || !swapTokenDestination) {
      setErrorMessage('Error retrieving token details');
      return;
    }

    // determine amount based on market price and token decimals
    const sourceAmt = parseFloat(amtUsd) / swapTokenSource.price;
    const sourceAmountInDecimals = Math.floor(
      sourceAmt * Math.pow(10, swapTokenSource.decimals),
    );

    // retrieve the quote
    const quotesResponse = await getSwapQuote({
      // information about source token
      fromChain: getBlockchainName(sourceToken.symbol).toLowerCase(),
      fromChainDecimal: swapTokenSource.decimals,
      fromTokenAddress: swapTokenSource.address,
      fromUserAddress: sourceToken.walletAddress,
      tokenSymbol: getBlockchainDisplaySymbol(sourceToken.ticker),
      tokenAmount: String(sourceAmountInDecimals),

      // information about destination token
      toChain: getBlockchainName(destinationToken.symbol).toLowerCase(),
      toChainDecimal: swapTokenDestination.decimals,
      toTokenAddress: swapTokenDestination.address,
      toTokenSymbol: getBlockchainDisplaySymbol(destinationToken.ticker),
      toUserAddress: destinationToken.walletAddress,
    });
    setIsGettingQuote(false);

    // validate result
    if (!quotesResponse?.routes || quotesResponse.routes.length === 0) {
      setErrorMessage('Unable to find quote');
      return;
    }

    // store quotes sorted by time, price impact and fees
    quotesResponse.routes = quotesResponse.routes.sort((a, b) => {
      return (
        // lowest duration
        a.duration - b.duration ||
        // lowest price impact
        parseFloat(b.quote.priceImpact || '0') -
          parseFloat(a.quote.priceImpact || '0') ||
        // lowest fee
        a.quote.fees
          .map(f => parseFloat(f.amountUSD))
          .reduce((c, d) => c + d, 0) -
          b.quote.fees
            .map(f => parseFloat(f.amountUSD))
            .reduce((c, d) => c + d, 0)
      );
    });
    setQuotes(quotesResponse.routes);

    // set quote amounts for each token
    setSourceTokenDescription(
      `Sell ~**${new Intl.NumberFormat('en-US', {
        maximumSignificantDigits: 6,
      }).format(sourceAmt)}** ${getBlockchainDisplaySymbol(
        sourceToken.ticker,
      )}`,
    );
    setDestinationTokenDescription(
      `Receive ~**${new Intl.NumberFormat('en-US', {
        maximumSignificantDigits: 6,
      }).format(
        parseFloat(quotesResponse.routes[0].quote.amount) /
          Math.pow(10, quotesResponse.routes[0].quote.decimals),
      )}** ${getBlockchainDisplaySymbol(destinationToken.ticker)}`,
    );
  };

  const getQuoteDescription = (q: Route) => {
    const quoteFee = q.quote.fees
      .map(f => parseFloat(f.amountUSD))
      .reduce((a, b) => a + b, 0);

    return `${quoteFee.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    })} network fee / ${q.duration} minute${q.duration > 1 ? 's' : ''}`;
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
        token.type === TokenType.Native,
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  const sourceTokens: TokenEntry[] = allTokens
    .filter(token => token.balance > 0)
    .filter(token =>
      config.WALLETS.CHAINS.SWAP.includes(
        `${token.symbol.toUpperCase()}/${token.ticker.toUpperCase()}`,
      ),
    )
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
            sourceTokens.length === 0 &&
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
            <InputLabel id="source-token-label">Select source token</InputLabel>
            <Select
              labelId="source-token-label"
              id="source-token"
              value={sourceToken?.symbol}
              label="Select source token"
              onChange={handleSourceChange}
            >
              {sourceTokens.map(v => (
                <MenuItem value={v.symbol}>
                  {getBlockchainDisplaySymbol(v.ticker)} on {v.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText className={classes.tokenAmount}>
              <Markdown>{sourceTokenDescription || ''}</Markdown>
            </FormHelperText>
          </FormControl>
          <FormControl
            className={classes.dropDown}
            disabled={!sourceToken || isGettingQuote || isSwapping}
          >
            <InputLabel id="destination-token-label">
              Select destination token
            </InputLabel>
            <Select
              labelId="destination-token-label"
              id="destination-token"
              value={destinationToken?.symbol}
              label="Select destination token"
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
            <FormHelperText className={classes.tokenAmount}>
              <Markdown>{destinationTokenDescription || ''}</Markdown>
            </FormHelperText>
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
                : `Swap ${parseFloat(amtUsd)
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
