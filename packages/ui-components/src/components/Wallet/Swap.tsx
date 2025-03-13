import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
// eslint-disable-next-line no-restricted-imports
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {darken} from '@mui/material/styles';
import cloneDeep from 'lodash/cloneDeep';
import numeral from 'numeral';
import React, {useEffect, useRef, useState} from 'react';
import useAsyncEffect from 'use-async-effect';
import {useDebounce} from 'usehooks-ts';

import config from '@unstoppabledomains/config';
import type {SwapConfig} from '@unstoppabledomains/config/build/src/env/types';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {
  createTransactionOperation,
  getOperationStatus,
} from '../../actions/fireBlocksActions';
import {
  getSwapQuote,
  getSwapTokens,
  getSwapTransactionPlan,
} from '../../actions/swapActions';
import {useDomainConfig, useFireblocksState} from '../../hooks';
import useFireblocksMessageSigner from '../../hooks/useFireblocksMessageSigner';
import type {SerializedWalletBalance, TokenEntry} from '../../lib';
import {
  DomainProfileKeys,
  TokenType,
  getAccountIdFromBootstrapState,
  getBootstrapState,
  notifyEvent,
  useTranslationContext,
} from '../../lib';
import {pollForSuccess} from '../../lib/poll';
import {
  FB_MAX_RETRY,
  FB_WAIT_TIME_MS,
  OperationStatusType,
} from '../../lib/types/fireBlocks';
import type {GetOperationResponse} from '../../lib/types/fireBlocks';
import type {
  SwapConfigToken,
  SwapMode,
  SwapQuote,
  SwapQuoteRequest,
  SwapToken as SwingSwapToken,
} from '../../lib/types/swap';
import {isSwapConfigTokenEqual} from '../../lib/types/swap';
import {getAsset} from '../../lib/wallet/asset';
import {getAllTokens} from '../../lib/wallet/evm/token';
import {
  broadcastTx,
  deserializeTxHex,
  signTransaction,
  waitForTx,
} from '../../lib/wallet/solana/transaction';
import {isEthAddress, localStorageWrapper} from '../Chat';
import ManageInput from '../Manage/common/ManageInput';
import {
  getBlockchainDisplaySymbol,
  getBlockchainGasSymbol,
  getBlockchainSymbol,
} from '../Manage/common/verification/types';
import Modal from '../Modal';
import FullScreenCta from './FullScreenCta';
import FundWalletModal from './FundWalletModal';
import type {SwapTokenModalMode} from './SwapTokenModal';
import SwapTokenModal from './SwapTokenModal';
import {TitleWithBackButton} from './TitleWithBackButton';
import Token from './Token';

const NATIVE_DECIMAL_FORMAT = '0.[000000]';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    marginTop: theme.spacing(2),
    overflowY: 'auto',
  },
  flexColCenterAligned: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  noTokensContainer: {
    textAlign: 'center',
    height: '100%',
  },
  button: {
    marginBottom: theme.spacing(1),
  },
  sliderContainer: {
    width: '100%',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(2),
  },
  tokenContainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    borderRadius: theme.shape.borderRadius,
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
    backgroundColor: darken(
      theme.palette.background.paper,
      theme.palette.mode === 'dark' ? 0.15 : 0.05,
    ),
  },
  tokenBalanceContainer: {
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
    color: theme.palette.neutralShades[600],
  },
  tokenInputRoot: {
    '& .MuiOutlinedInput-notchedOutline': {
      display: 'none',
    },
  },
  tokenInput: {
    backgroundColor: darken(
      theme.palette.background.paper,
      theme.palette.mode === 'dark' ? 0.15 : 0.05,
    ),
  },
  tokenSelected: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '250px',
    minHeight: '58px',
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[2],
  },
  tokenLoading: {
    color: theme.palette.neutralShades[400],
  },
  swapIconContainer: {
    position: 'absolute',
    top: '-28px',
    left: '50%',
    transform: 'translate(-50%)',
    borderRadius: '50%',
    padding: theme.spacing(0.5),
    border: `${theme.spacing(0.5)}px solid ${theme.palette.background.paper}`,
    backgroundColor: theme.palette.background.paper,
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapIcon: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    color: theme.palette.neutralShades[400],
    width: '30px',
    height: '30px',
  },
  loadingSpinner: {
    padding: theme.spacing(0.5),
  },
  successIcon: {
    color: theme.palette.success.main,
  },
  learnMoreLink: {
    display: 'inline-flex',
  },
}));

type Props = {
  onCancelClick: () => void;
  onClickReceive?: () => void;
  onClickBuy?: () => void;
  onViewTokenClick?: (token: TokenEntry) => void;
  accessToken: string;
  wallets: SerializedWalletBalance[];
  initialSelectedToken?: TokenEntry;
};

const Swap: React.FC<Props> = ({
  onCancelClick,
  onClickBuy,
  onClickReceive,
  onViewTokenClick,
  accessToken,
  wallets,
  initialSelectedToken,
}) => {
  // page state
  const [t] = useTranslationContext();
  const {classes, cx} = useStyles();
  const isMounted = useRef(false);
  const [showSwapIntro, setShowSwapIntro] = useState(false);
  const {setShowSuccessAnimation} = useDomainConfig();

  // fireblocks state
  const [state] = useFireblocksState();
  const clientState = getBootstrapState(state);
  const fireblocksMessageSigner = useFireblocksMessageSigner();

  // operation state
  const [isGettingQuote, setIsGettingQuote] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [isTxComplete, setIsTxComplete] = useState(false);
  const [txId, setTxId] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();

  // swap pair state
  const [allSwapTokens, setAllSwapTokens] = useState<SwingSwapToken[]>([]);
  const [sliderValue, setSliderValue] = useState(0);
  const [sourceTokenAmountMode, setSourceTokenAmountMode] =
    useState<SwapMode>('usd');
  const [sourceTokenAmountStr, setSourceTokenAmountStr] = useState<string>();
  const sourceTokenAmount = parseFloat(sourceTokenAmountStr || '0');
  const sourceTokenAmountDebounced = useDebounce<number>(
    sourceTokenAmount,
    1250, // 1.25 seconds debounce
  );
  const [sourceToken, setSourceToken] = useState<SwapConfigToken>();
  const [destinationTokenAmountStr, setDestinationTokenAmountStr] =
    useState<string>();
  const destinationTokenAmount = parseFloat(destinationTokenAmountStr || '0');
  const [destinationToken, setDestinationToken] = useState<SwapConfigToken>();
  const [showSlider, setShowSlider] = useState(false);

  // token chooser state
  const [isTokensLoading, setIsTokensLoading] = useState(false);
  const [tokenChooserOpen, setTokenChooserOpen] = useState(false);
  const [tokenChooserMode, setTokenChooserMode] =
    useState<SwapTokenModalMode>('source');

  // quote state
  const [quoteRequest, setQuoteRequest] = useState<SwapQuoteRequest>();
  const [quotes, setQuotes] = useState<SwapQuote[]>();
  const [quoteType, setQuoteType] = useState<'fastest' | 'cheapest'>(
    'cheapest',
  );

  // build list of all available wallet tokens
  const allTokens = getAllTokens(wallets).filter(
    token =>
      token.type === TokenType.Erc20 ||
      token.type === TokenType.Spl ||
      token.type === TokenType.Native,
  );

  // retrieve a reference to the gas token
  const gasToken = sourceToken
    ? allTokens?.find(
        configToken =>
          configToken.type === TokenType.Native &&
          configToken.ticker ===
            getBlockchainGasSymbol(sourceToken.chainSymbol),
      )
    : undefined;

  // wallet balance
  const allTokensValueUsd = allTokens
    .map(token => token.balance)
    .reduce((a, b) => a + b, 0);

  const getTokenEntry = (
    swapConfig: SwapConfig,
    placeholder?: boolean,
  ): TokenEntry | undefined => {
    const entry = allTokens?.find(
      token =>
        token.walletName.toLowerCase() === swapConfig.chainName.toLowerCase() &&
        token.ticker.toLowerCase() === swapConfig.tokenSymbol.toLowerCase(),
    );
    if (entry) {
      return entry;
    }
    if (placeholder) {
      const token: TokenEntry = {
        type: swapConfig.swing.type as TokenType,
        symbol: swapConfig.chainSymbol,
        ticker: swapConfig.tokenSymbol,
        name: swapConfig.tokenSymbol,
        imageUrl: swapConfig.imageUrl,
        walletName: swapConfig.chainName,
        walletAddress: '',
        walletBlockChainLink: '',
        tokenConversionUsd: 0,
        balance: 0,
        value: 0,
      };
      return token;
    }
    return undefined;
  };

  // retrieves only fees associated with the source blockchain
  const getSourceGasFees = (q: SwapQuote, nativeOnly = false) => {
    if (!q?.quote?.fees) {
      return 0;
    }

    return q.quote.fees
      .filter(f => f.type === 'gas')
      .map(f =>
        sourceTokenAmountMode === 'usd' && !nativeOnly
          ? parseFloat(f.amountUSD)
          : parseFloat(f.amount) / Math.pow(10, f.decimals),
      )
      .reduce((a, b) => a + b, 0);
  };

  // retrieves total USD amount for all fees
  const getTotalFeesUsd = (q: SwapQuote) => {
    if (!q?.quote?.fees) {
      return 0;
    }

    return q.quote.fees
      .map(f => parseFloat(f.amountUSD))
      .reduce((a, b) => a + b, 0);
  };

  const getFeeSummaryTable = (q: SwapQuote) => {
    const aggregatedFees: Record<string, {amount: number; amountUSD: number}> =
      {};
    q.quote.fees?.map(f => {
      const existing = aggregatedFees[f.tokenSymbol];
      if (existing) {
        existing.amount += parseFloat(f.amount) / Math.pow(10, f.decimals);
        existing.amountUSD += parseFloat(f.amountUSD);
      } else {
        aggregatedFees[f.tokenSymbol] = {
          amount: parseFloat(f.amount) / Math.pow(10, f.decimals),
          amountUSD: parseFloat(f.amountUSD),
        };
      }
    });

    return (
      <Box mb={1} mt={1} width="100%">
        <Alert severity="info" data-testid="fee-summary-table">
          <Typography variant="body2" fontWeight="bold" mb={1}>
            {t('wallet.feeSummary')}
          </Typography>
          <Grid container spacing={0.5}>
            <Grid item xs={4}>
              <Typography variant="caption" fontWeight="bold">
                {t('verifiedWallets.token')}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" fontWeight="bold">
                {t('wallet.amount')}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" fontWeight="bold">
                $ USD
              </Typography>
            </Grid>
            {Object.keys(aggregatedFees).map(tokenSymbol => (
              <>
                <Grid item xs={4}>
                  <Typography variant="caption">{tokenSymbol}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption">
                    {numeral(aggregatedFees[tokenSymbol].amount).format(
                      NATIVE_DECIMAL_FORMAT,
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption">
                    {aggregatedFees[tokenSymbol].amountUSD.toLocaleString(
                      'en-US',
                      {
                        style: 'currency',
                        currency: 'USD',
                      },
                    )}
                  </Typography>
                </Grid>
              </>
            ))}
          </Grid>
        </Alert>
      </Box>
    );
  };

  // sort quotes sorted by fastest execution
  const quotesByLowestTime = cloneDeep(quotes)
    // only show quotes the user can afford
    ?.filter(q =>
      q && gasToken ? gasToken.balance > getSourceGasFees(q, true) : false,
    )
    // sort by fastest execution time
    .sort((a, b) => {
      return (
        // lowest duration
        a.duration - b.duration ||
        // lowest fee
        a.quote.fees
          .map(f => parseFloat(f.amountUSD))
          .reduce((c, d) => c + d, 0) -
          b.quote.fees
            .map(f => parseFloat(f.amountUSD))
            .reduce((c, d) => c + d, 0) ||
        // lowest price impact
        parseFloat(b.quote.priceImpact || '0') -
          parseFloat(a.quote.priceImpact || '0')
      );
    });
  const quoteFastest =
    quotesByLowestTime && quotesByLowestTime.length > 0
      ? quotesByLowestTime[0]
      : undefined;

  // sort quotes sorted by lowest fee
  const quotesByLowestFee = cloneDeep(quotes)?.sort((a, b) => {
    return (
      // lowest fee
      a.quote.fees
        .map(f => parseFloat(f.amountUSD))
        .reduce((c, d) => c + d, 0) -
        b.quote.fees
          .map(f => parseFloat(f.amountUSD))
          .reduce((c, d) => c + d, 0) ||
      // lowest price impact
      parseFloat(b.quote.priceImpact || '0') -
        parseFloat(a.quote.priceImpact || '0') ||
      // lowest duration
      a.duration - b.duration
    );
  });
  const quoteCheapest =
    quotesByLowestFee && quotesByLowestFee.length > 0
      ? quotesByLowestFee[0]
      : undefined;

  // currently selected quote
  const quoteSelected = quoteType === 'cheapest' ? quoteCheapest : quoteFastest;

  const isCheapestQuote = (q: SwapQuote) => {
    if (!quotesByLowestFee || quotesByLowestFee.length === 0) {
      return false;
    }
    return JSON.stringify(quotesByLowestFee[0]) === JSON.stringify(q);
  };

  const isMultipleQuotes = () => {
    if (
      !quotesByLowestTime ||
      quotesByLowestTime.length === 0 ||
      !quotesByLowestFee ||
      quotesByLowestFee.length === 0
    ) {
      return false;
    }

    return (
      JSON.stringify(quotesByLowestTime[0]) !==
      JSON.stringify(quotesByLowestFee[0])
    );
  };

  // determine if there are sufficient gas funds
  const isInsufficientGasFunds =
    quoteSelected && sourceToken && sourceToken.swing.type !== 'native'
      ? (gasToken?.balance || 0) < getSourceGasFees(quoteSelected, true)
      : false;

  // determine if there are sufficient token funds
  const isInsufficientTokenFunds =
    quoteSelected && sourceToken && getTokenEntry(sourceToken)
      ? sourceToken.swing.type === 'native'
        ? // handle native funding requirements
          sourceTokenAmountMode === 'usd'
          ? getTokenEntry(sourceToken)!.value <
            sourceTokenAmount + getSourceGasFees(quoteSelected)
          : getTokenEntry(sourceToken)!.balance <
            sourceTokenAmount + getSourceGasFees(quoteSelected)
        : // handle token funding requirements
          getTokenEntry(sourceToken)!.balance < sourceTokenAmount
      : // no quote selected
        false;

  // determine if sufficient overall funds
  const isInsufficientFunds =
    isInsufficientGasFunds || isInsufficientTokenFunds;

  // determines if button is visible
  const isButtonHidden =
    txId ||
    isTxComplete ||
    isSwapping ||
    isGettingQuote ||
    !!errorMessage ||
    !sourceToken ||
    !destinationToken ||
    !sourceTokenAmount ||
    !quoteSelected ||
    isInsufficientFunds;

  // determines if the page is in loading state
  const isLoading = isGettingQuote || isSwapping;

  // determines if the switch currency button is visible
  const isSwitchModeButtonVisible =
    !isLoading &&
    !errorMessage &&
    !txId &&
    !isTxComplete &&
    !isInsufficientFunds &&
    !showSwapIntro;

  // list of swap pairs found on DEX
  const allDexTokenConfigs: SwapConfig[] = allSwapTokens.map(token => {
    const walletType = getBlockchainSymbol(token.chain);
    const isNative = [
      '11111111111111111111111111111111',
      '0x0000000000000000000000000000000000000000',
    ].includes(token.address);
    const retVal: SwapConfig = {
      swing: {
        chain: token.chain,
        chainId: isEthAddress(token.address)
          ? config.WALLETS.SWAP.SUPPORTED_TOKENS.SOURCE.find(
              tConfig =>
                tConfig.swing.chain.toLowerCase() === token.chain.toLowerCase(),
            )?.swing.chainId
          : undefined,
        symbol: token.address,
        type: isNative ? 'native' : token.chain === 'solana' ? 'spl' : 'erc20',
        priceUsd: token.priceUsd,
      },
      liquidityUsd: token.liquidityUsd,
      chainName: token.chain,
      chainSymbol: walletType,
      tokenSymbol: isNative
        ? getBlockchainGasSymbol(token.symbol)
        : token.symbol,
      imageUrl: token.logo,
      walletType,
    };
    return retVal;
  });

  // augment list with tokens found in wallet
  const allWalletTokenConfigs: SwapConfig[] = allTokens
    .filter(token => {
      return !allDexTokenConfigs.find(
        tokenConfig =>
          tokenConfig.swing.chain.toLowerCase() ===
            token.walletName.toLowerCase() &&
          tokenConfig.tokenSymbol.toLowerCase() === token.ticker.toLowerCase(),
      );
    })
    .map(token => {
      const retVal: SwapConfig = {
        swing: {
          chain: token.walletName.toLowerCase(),
          chainId: isEthAddress(token.walletAddress)
            ? config.WALLETS.SWAP.SUPPORTED_TOKENS.SOURCE.find(
                tConfig =>
                  tConfig.swing.chain.toLowerCase() ===
                  token.walletName.toLowerCase(),
              )?.swing.chainId
            : undefined,
          symbol: token.address || token.ticker,
          type:
            token.type === TokenType.Native
              ? 'native'
              : token.type === TokenType.Erc20
              ? 'erc20'
              : 'spl',
        },
        chainName: token.walletName,
        chainSymbol: token.symbol,
        tokenSymbol: token.ticker,
        imageUrl: token.imageUrl || '',
        walletType: token.walletType || '',
      };
      return retVal;
    });

  // aggregated list of token configs
  const allTokenConfigs = [...allDexTokenConfigs, ...allWalletTokenConfigs];

  // build list of supported source tokens with sufficient balance
  const sourceTokens: SwapConfigToken[] = (
    allDexTokenConfigs.length > 0
      ? allTokenConfigs
      : config.WALLETS.SWAP.SUPPORTED_TOKENS.SOURCE
  )
    .filter(configToken => getTokenEntry(configToken))
    .map(configToken => {
      const walletToken = getTokenEntry(configToken)!;
      return {
        ...configToken,
        liquidityUsd: configToken.liquidityUsd || 0,
        walletAddress: walletToken.walletAddress,
        balance: walletToken.balance,
        value: walletToken.value,
        disabledReason:
          configToken.disabledReason ||
          (!walletToken.value
            ? t('wallet.insufficientBalance')
            : walletToken.value < config.WALLETS.SWAP.MIN_BALANCE_USD
            ? configToken.swing.type === 'native'
              ? t('wallet.insufficientBalance')
              : undefined
            : undefined),
      };
    })
    .sort(
      (a, b) =>
        // sort be enabled first
        (!!a.disabledReason === !!b.disabledReason
          ? 0
          : b.disabledReason
          ? -1
          : 1) ||
        // sort by value descending
        b.value - a.value ||
        // sort by balance descending
        b.balance - a.balance ||
        // sort by chain name ascending
        a.chainName.localeCompare(b.chainName) ||
        // sort by symbol ascending
        a.tokenSymbol.localeCompare(b.tokenSymbol),
    );

  // build list of supported destination tokens
  const destinationTokens: SwapConfigToken[] = (
    allDexTokenConfigs.length > 0
      ? allTokenConfigs
      : config.WALLETS.SWAP.SUPPORTED_TOKENS.DESTINATION
  )
    .filter(configToken => getTokenEntry(configToken, true))
    .map(configToken => {
      return {
        ...configToken,
        liquidityUsd: configToken.liquidityUsd || 0,
        walletAddress:
          wallets.find(w => w.symbol === configToken.walletType)?.address || '',
      };
    })
    .map(configToken => {
      const walletToken = getTokenEntry(configToken)!;
      return {
        ...configToken,
        walletAddress: walletToken?.walletAddress || configToken.walletAddress,
        balance: walletToken?.balance,
        value: walletToken?.value,
      };
    })
    .filter(v => !isSwapConfigTokenEqual(v, sourceToken))
    .sort(
      (a, b) =>
        (b.value || 0) - (a.value || 0) ||
        (b.balance || 0) - (a.balance || 0) ||
        (b.liquidityUsd || 0) - (a.liquidityUsd || 0) ||
        a.chainName.localeCompare(b.chainName) ||
        a.tokenSymbol.localeCompare(b.tokenSymbol),
    );

  useAsyncEffect(async () => {
    // determine swap intro visibility
    const accountId = getAccountIdFromBootstrapState(clientState);
    const swapIntroState = await localStorageWrapper.getItem(
      DomainProfileKeys.BannerSwapIntro,
      {
        type: 'wallet',
        accessToken,
        accountId,
      },
    );
    setShowSwapIntro(!swapIntroState);

    // determine swap mode
    const swapMode = await localStorageWrapper.getItem(
      DomainProfileKeys.WalletSwapMode,
      {
        type: 'wallet',
        accessToken,
        accountId,
      },
    );
    if (swapMode) {
      setSourceTokenAmountMode(swapMode as SwapMode);
    }

    // load all available tokens
    setIsTokensLoading(true);
    setAllSwapTokens(await getSwapTokens());
    setIsTokensLoading(false);

    // determine mounted state
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // automatically select a source token
  useEffect(() => {
    if (sourceToken) {
      return;
    }
    if (
      !sourceTokens ||
      sourceTokens.length === 0 ||
      (isTokensLoading && initialSelectedToken)
    ) {
      return;
    }
    if (initialSelectedToken) {
      const initialSelectedConfig = sourceTokens.find(
        configToken =>
          configToken.swing.chain.toLowerCase() ===
            initialSelectedToken.walletName.toLowerCase() &&
          (configToken.swing.symbol.toLowerCase() ===
            initialSelectedToken.address?.toLowerCase() ||
            configToken.tokenSymbol.toLowerCase() ===
              initialSelectedToken.ticker.toLowerCase()),
      );
      if (initialSelectedConfig) {
        setSourceToken(initialSelectedConfig);
      }
    } else if (!isSwapConfigTokenEqual(sourceTokens[0], sourceToken)) {
      setSourceToken(sourceTokens[0]);
    }
  }, [initialSelectedToken, sourceToken, sourceTokens, isTokensLoading]);

  // automatically select a destination token
  useEffect(() => {
    if (destinationToken) {
      return;
    }
    if (!sourceToken || !destinationTokens || destinationTokens.length === 0) {
      return;
    }
    const swapTokensOnSameChain = destinationTokens.filter(
      configToken => configToken.swing.chain === sourceToken.swing.chain,
    );
    const swapDestinationConfig =
      swapTokensOnSameChain.length > 0
        ? swapTokensOnSameChain[0]
        : destinationTokens[0];
    setDestinationToken(swapDestinationConfig);
  }, [sourceToken, destinationToken, destinationTokens]);

  // update the destination token if it conflicts with source token
  useEffect(() => {
    if (!sourceToken || !destinationToken) {
      return;
    }
    if (isSwapConfigTokenEqual(sourceToken, destinationToken)) {
      setDestinationToken(destinationTokens[0]);
    }
  }, [sourceToken]);

  // retrieve quote when a swap pair is selected
  useEffect(() => {
    if (!sourceTokenAmountDebounced || !sourceToken || !destinationToken) {
      return;
    }

    // set the slider amount
    const tokenEntry = getTokenEntry(sourceToken);
    if (tokenEntry) {
      const pctValue = Math.floor(
        100 * (sourceTokenAmountDebounced / tokenEntry.value),
      );
      if (sliderValue !== pctValue) {
        setSliderValue(pctValue);
      }
    }

    // get the quote
    void handleGetQuote();
  }, [sourceTokenAmountDebounced, sourceToken, destinationToken]);

  const handleToggleSlider = (show: boolean) => {
    setShowSlider(show);
  };

  const handleToggleMode = async () => {
    const newMode = sourceTokenAmountMode === 'usd' ? 'native' : 'usd';
    setSourceTokenAmountMode(newMode);
    await localStorageWrapper.setItem(
      DomainProfileKeys.WalletSwapMode,
      newMode,
      {
        type: 'wallet',
        accessToken,
        accountId: getAccountIdFromBootstrapState(clientState),
      },
    );
  };

  const handleSwapInfoClicked = async () => {
    setShowSwapIntro(false);
    await localStorageWrapper.setItem(
      DomainProfileKeys.BannerSwapIntro,
      String(Date.now()),
      {
        type: 'wallet',
        accessToken,
        accountId: getAccountIdFromBootstrapState(clientState),
      },
    );
  };

  const handleSwitchQuotes = () => {
    if (!quoteSelected) {
      return;
    }
    if (isCheapestQuote(quoteSelected)) {
      setQuoteType('fastest');
      const v = numeral(quoteFastest?.quote.amountUSD || '0').format('0.00');
      if (v) {
        setDestinationTokenAmountStr(v);
      }
    } else {
      setQuoteType('cheapest');
      const v = numeral(quoteCheapest?.quote.amountUSD || '0').format('0.00');
      if (v) {
        setDestinationTokenAmountStr(v);
      }
    }
  };

  const handleTransactionClick = () => {
    if (!sourceToken) {
      return;
    }
    window.open(
      `${
        config.BLOCKCHAINS[
          sourceToken.chainSymbol as keyof typeof config.BLOCKCHAINS
        ].BLOCK_EXPLORER_TX_URL
      }${txId}`,
      '_blank',
    );
  };

  const handleViewTokenClick = () => {
    if (onViewTokenClick && destinationToken) {
      const tokenEntry = getTokenEntry(destinationToken, true);
      if (tokenEntry) {
        onViewTokenClick(tokenEntry);
      }
    }
  };

  const handleResetState = (opts?: {sourceAmtUsd?: boolean}) => {
    // default items to clear
    setIsTxComplete(false);
    setTxId(undefined);
    setQuotes(undefined);
    setErrorMessage(undefined);
    setDestinationTokenAmountStr(undefined);
    setShowSuccessAnimation(false);

    // optional items to clear
    if (opts?.sourceAmtUsd) {
      setSliderValue(0);
      setSourceTokenAmountStr(undefined);
    }
  };

  const handleSliderChange = (_e: Event, v: number | number[]) => {
    if (!sourceToken) {
      return;
    }
    const tokenEntry = getTokenEntry(sourceToken);
    if (!tokenEntry) {
      return;
    }

    // reset quote state
    handleResetState();

    // set the form elements
    const pctSelected = v as number;
    const valueSelected =
      (sourceTokenAmountMode === 'usd'
        ? tokenEntry.value
        : tokenEntry.balance) *
      (pctSelected / 100);
    setSliderValue(pctSelected);
    setSourceTokenAmountStr(
      sourceTokenAmountMode === 'usd'
        ? numeral(valueSelected).format('0.00')
        : numeral(valueSelected).format(NATIVE_DECIMAL_FORMAT),
    );
  };

  const handleTokenClicked = (mode: SwapTokenModalMode) => {
    // clear any existing quotes when source token list is clicked
    if (quoteSelected) {
      handleResetState({sourceAmtUsd: true});
    }

    // open the token chooser
    setTokenChooserMode(mode);
    setTokenChooserOpen(true);
  };

  const handleTokenSelected = (
    mode: SwapTokenModalMode,
    v: SwapConfigToken,
  ) => {
    setTokenChooserOpen(false);
    handleResetState();
    setQuoteType('cheapest');
    if (mode === 'source') {
      setSourceToken(v);
    } else {
      setDestinationToken(v);
    }
  };

  const handleAmountChanged = async (id: string, v: string) => {
    try {
      // reset swap state
      handleResetState();
      setQuoteType('cheapest');

      // parse provided text
      const parsedValue = v.replaceAll('$', '');
      if (parsedValue) {
        // set the source token amount
        if (id === 'source-token-amount') {
          setSourceTokenAmountStr(parsedValue);
          return;
        }

        // set the destination token amount and derive the source token amount
        setDestinationTokenAmountStr(parsedValue);
        if (sourceTokenAmountMode === 'usd') {
          // set the source amount to the USD value
          setDestinationTokenAmountStr(parsedValue);
          setSourceTokenAmountStr(parsedValue);
        } else if (sourceToken?.value && sourceToken?.balance) {
          // source token spot price
          const sourceTokenSpotPrice = sourceToken.value / sourceToken.balance;

          // destination token spot price
          const destinationTokenSpotPrice =
            destinationToken?.value && destinationToken.balance
              ? destinationToken.value / destinationToken.balance
              : destinationToken?.swing.priceUsd
              ? destinationToken.swing.priceUsd
              : allDexTokenConfigs.find(
                  dexToken =>
                    dexToken.chainName.toLowerCase() ===
                      destinationToken?.swing.chain.toLowerCase() &&
                    dexToken.tokenSymbol.toLowerCase() ===
                      destinationToken?.tokenSymbol.toLowerCase(),
                )?.swing.priceUsd || 0;

          // derive the expected source token amount in native currency
          const derivedSourceAmount =
            (parseFloat(parsedValue) * destinationTokenSpotPrice) /
            sourceTokenSpotPrice;

          // set the derived source token amount
          setSourceTokenAmountStr(
            numeral(derivedSourceAmount).format(NATIVE_DECIMAL_FORMAT),
          );
        }
      }
      return;
    } catch (e) {}
    handleResetState({sourceAmtUsd: true});
  };

  const handleGetQuote = async () => {
    // validate parameters
    if (!sourceToken || !destinationToken) {
      throw new Error('source and destination tokens are required');
    }

    // hide the swap intro
    setShowSwapIntro(false);

    // reset state
    setIsGettingQuote(true);
    setErrorMessage(undefined);

    try {
      // create a quote request and query the swap service
      const request: SwapQuoteRequest = {
        // information about source token
        fromChain: sourceToken.swing.chain,
        fromToken: sourceToken.swing.symbol,
        fromTokenAmount:
          sourceTokenAmountMode === 'native'
            ? // swap the native token amount
              String(sourceTokenAmount)
            : sliderValue === 100 &&
              sourceToken.swing.type !== 'native' &&
              sourceToken.balance
            ? // swap the entire on-native token balance if "max" slider is selected
              String(sourceToken.balance)
            : // no value required
              undefined,
        fromTokenAmountUsd:
          sourceTokenAmountMode === 'usd'
            ? // swap the specified USD amount
              String(sourceTokenAmount)
            : undefined,
        // information about destination token
        toChain: destinationToken.swing.chain,
        toToken: destinationToken.swing.symbol,
        toWalletAddress: destinationToken.walletAddress,
      };
      const quotesResponse = await getSwapQuote(
        sourceToken.walletAddress,
        request,
      );
      setQuoteRequest(request);

      // validate result
      if (!quotesResponse) {
        setErrorMessage(
          t('swap.noQuoteAvailable', {
            source: getBlockchainDisplaySymbol(sourceToken.tokenSymbol),
            destination: getBlockchainDisplaySymbol(
              destinationToken.tokenSymbol,
            ),
          }),
        );
        return;
      }

      // store a list of all available quotes
      setQuotes(quotesResponse);

      // set quote amounts for each token
      if (sourceTokenAmountMode === 'usd') {
        const destinationTokenBalance =
          parseFloat(quotesResponse[0].quote.amount) /
          Math.pow(10, quotesResponse[0].quote.decimals);
        const destinationUsd =
          quotesResponse[0].quote.amountUSD &&
          parseFloat(quotesResponse[0].quote.amountUSD)
            ? Math.min(
                parseFloat(quotesResponse[0].quote.amountUSD) -
                  quotesResponse[0].quote.fees
                    ?.map(f => parseFloat(f.amountUSD))
                    .reduce((a, b) => a + b, 0),
                sourceTokenAmount,
              )
            : sourceToken.tokenSymbol === destinationToken.tokenSymbol &&
              sourceToken.value &&
              sourceToken.balance
            ? (sourceToken.value / sourceToken.balance) *
              destinationTokenBalance
            : 0;
        setDestinationTokenAmountStr(numeral(destinationUsd).format('0.00'));
      } else {
        setDestinationTokenAmountStr(
          numeral(
            parseFloat(quotesResponse[0].quote.amount) /
              Math.pow(10, quotesResponse[0].quote.decimals),
          ).format(NATIVE_DECIMAL_FORMAT),
        );
      }
    } catch (e) {
      notifyEvent(e, 'error', 'Wallet', 'Transaction', {
        msg: 'error retrieving swap quote',
      });
    } finally {
      setIsGettingQuote(false);
    }
  };

  const handleSubmitTransaction = async () => {
    if (
      !quoteRequest ||
      !quoteSelected ||
      !sourceToken ||
      !destinationToken ||
      !quoteRequest
    ) {
      return;
    }

    try {
      // retrieve and validate fireblocks state
      setIsSwapping(true);
      if (!clientState) {
        throw new Error('invalid wallet client state');
      }

      // retrieve and validate the asset required to sign this message
      const asset = getAsset(clientState.assets, {
        chainId: sourceToken.swing.chainId,
      });
      if (!asset?.accountId) {
        throw new Error('error retrieving source asset from wallet state');
      }

      // request the transaction details required to swap
      const txPlanResponse = await getSwapTransactionPlan(
        sourceToken.walletAddress,
        quoteRequest,
        quoteSelected,
      );

      // validate the response
      if (!txPlanResponse || txPlanResponse.length === 0) {
        throw new Error('swap transaction plan not found');
      }

      // create and validate the swap transaction
      if (
        sourceToken.chainSymbol.toLowerCase() === 'sol' &&
        typeof txPlanResponse[0].transaction === 'string'
      ) {
        // sign and the solana tx
        const preparedTx = deserializeTxHex(txPlanResponse[0].transaction);
        const signedTx = await signTransaction(
          preparedTx,
          sourceToken.walletAddress,
          fireblocksMessageSigner,
          accessToken,
          false,
        );

        // broadcast the solana tx
        const txHash = await broadcastTx(
          signedTx,
          sourceToken.walletAddress,
          accessToken,
        );

        // solana swap is broadcasted
        setShowSuccessAnimation(true);
        setTxId(txHash);

        // wait for solana tx
        await waitForTx(txHash, sourceToken.walletAddress, accessToken);
      } else {
        for (let i = 0; i < txPlanResponse.length; i++) {
          const swapTx = txPlanResponse[i];
          if (typeof swapTx.transaction === 'string') {
            continue;
          }

          const operationResponse = await createTransactionOperation(
            accessToken,
            asset.accountId,
            asset.id,
            swapTx.transaction,
          );

          // ensure an operation was created successfully
          if (!operationResponse) {
            throw new Error('error creating MPC transaction for swap');
          }

          // sign the swap transaction
          await pollForSignature(operationResponse);

          // wait for complete and show set completion state
          await pollForCompletion(
            operationResponse,
            i === txPlanResponse.length - 1,
          );
        }
      }

      // transaction is complete
      setIsTxComplete(true);
    } catch (e) {
      setErrorMessage(t('swap.errorSwappingTokens'));
      notifyEvent(e, 'error', 'Wallet', 'Transaction', {
        msg: 'error creating swap transaction',
      });
    } finally {
      setIsSwapping(false);
    }
  };

  const pollForSignature = async (operationResponse: GetOperationResponse) => {
    const result = await pollForSuccess({
      fn: async () => {
        if (!isMounted.current) {
          throw new Error('Transaction cancelled by user');
        }
        const operationStatus = await getOperationStatus(
          accessToken,
          operationResponse.operation.id,
        );
        if (
          !operationStatus ||
          operationStatus.status === OperationStatusType.FAILED
        ) {
          throw new Error('Error requesting transaction operation status');
        } else if (operationStatus.status === OperationStatusType.COMPLETED) {
          return {success: true};
        } else if (operationStatus.transaction?.id) {
          return {success: true};
        }
        return {success: false};
      },
      attempts: FB_MAX_RETRY,
      interval: FB_WAIT_TIME_MS * 3,
    });
    if (!result.success) {
      throw new Error('Signature process failed');
    }
  };

  const pollForCompletion = async (
    operationResponse: GetOperationResponse,
    isLast: boolean,
  ) => {
    const result = await pollForSuccess({
      fn: async () => {
        // retrieve and validate the operation status
        const operationStatus = await getOperationStatus(
          accessToken,
          operationResponse.operation.id,
        );
        if (!operationStatus) {
          throw new Error('Error requesting transaction operation status');
        }
        if (
          operationStatus.status === OperationStatusType.FAILED ||
          operationStatus.status === OperationStatusType.CANCELLED
        ) {
          throw new Error(
            `Swap failed ${operationStatus.status.toLowerCase()}`,
          );
        }

        // handle transaction ID ready
        if (operationStatus.transaction?.id) {
          if (isLast) {
            // set transaction ID
            setTxId(operationStatus.transaction.id);

            // throw some confetti since the transaction is onchain
            setShowSuccessAnimation(true);
          }
        }

        // handle operation status success
        if (operationStatus.status === OperationStatusType.COMPLETED) {
          return {success: true};
        }
        return {success: false};
      },
      attempts: FB_MAX_RETRY,
      interval: FB_WAIT_TIME_MS * 3,
    });
    if (!result.success) {
      throw new Error('Transaction process failed');
    }
  };

  const getQuoteDescription = (q: SwapQuote) => {
    if (!sourceToken) {
      return '';
    }

    // calculate total fees associated with the quote for display on the
    // execution button in basic mode
    const fees =
      // prefer to show the delta between requested and resulting amount in USD
      Math.max(sourceTokenAmount - destinationTokenAmount, 0) ||
      // fallback to showing a sum of all USD fees
      getTotalFeesUsd(q);

    // return summarized quote information
    return `${
      // only show fees in the summary for basic mode
      sourceTokenAmountMode === 'usd' && fees > 0
        ? `${
            sourceTokenAmountMode === 'usd'
              ? fees.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                })
              : `${numeral(fees).format(
                  NATIVE_DECIMAL_FORMAT,
                )} ${getBlockchainDisplaySymbol(
                  getBlockchainGasSymbol(sourceToken.chainSymbol),
                )}`
          } ${t('wallet.fees').toLowerCase()} / `
        : ''
    } ETA ~ ${q.duration} ${t('common.minute')}${q.duration > 1 ? 's' : ''}`;
  };

  return (
    <Box className={classes.flexColCenterAligned}>
      {!showSwapIntro && (
        <TitleWithBackButton
          onCancelClick={onCancelClick}
          label={t('swap.description')}
        />
      )}
      <Box className={classes.container}>
        {showSwapIntro ? (
          <FullScreenCta
            onClick={handleSwapInfoClicked}
            onCancelClick={onCancelClick}
            icon={<SwapHorizIcon />}
            title={t('swap.introTitle')}
            description={t('swap.introContent')}
            learnMoreLink={config.WALLETS.SWAP.DOCUMENTATION_URL}
            buttonText={t('wallet.letsGo')}
          />
        ) : allTokensValueUsd === 0 &&
          allTokens.length > 0 &&
          sourceTokens.filter(v => !v.disabledReason).length === 0 &&
          onClickBuy &&
          onClickReceive ? (
          <Box className={classes.noTokensContainer}>
            <FundWalletModal
              onBuyClicked={onClickBuy}
              onReceiveClicked={onClickReceive}
              icon={<SwapHorizIcon />}
            />
          </Box>
        ) : (
          <Box className={classes.content}>
            <Box
              className={classes.tokenContainer}
              onMouseEnter={() => handleToggleSlider(true)}
              onMouseLeave={() => handleToggleSlider(false)}
            >
              <FormControl disabled={isLoading}>
                <ManageInput
                  id="source-token-amount"
                  label={t('swap.payWithToken')}
                  placeholder={sourceTokenAmountMode === 'usd' ? '0.00' : '0'}
                  value={sourceTokenAmountStr || ''}
                  stacked={true}
                  disabled={isLoading}
                  classes={{
                    root: classes.tokenInputRoot,
                    input: classes.tokenInput,
                  }}
                  onClick={() => handleToggleSlider(true)}
                  onChange={handleAmountChanged}
                  startAdornment={
                    sourceTokenAmountMode === 'usd' ? (
                      <Typography ml={2}>$</Typography>
                    ) : undefined
                  }
                  endAdornment={
                    <Box className={classes.tokenSelected}>
                      {sourceToken ? (
                        <Token
                          id="source"
                          key={`source-token-${sourceToken.swing.chain}-${sourceToken.swing.symbol}`}
                          token={getTokenEntry(sourceToken, true)}
                          hideBalance
                          isOwner
                          compact
                          mode={sourceTokenAmountMode}
                          iconWidth={6}
                          descriptionWidth={6}
                          graphWidth={0}
                          onClick={
                            sourceTokens.filter(v => !v.disabledReason)
                              .length === 0
                              ? undefined
                              : () => handleTokenClicked('source')
                          }
                        />
                      ) : (
                        <CircularProgress
                          size="30px"
                          className={classes.tokenLoading}
                        />
                      )}
                    </Box>
                  }
                />
                <FormHelperText className={classes.tokenBalanceContainer}>
                  {showSlider && (
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      width="100%"
                    >
                      <Box className={classes.sliderContainer}>
                        <Slider
                          step={5}
                          size="small"
                          defaultValue={0}
                          disabled={isLoading}
                          value={sliderValue}
                          onChange={handleSliderChange}
                          valueLabelDisplay="off"
                          marks={[
                            {value: 0, label: '0%'},
                            {value: 25, label: '25%'},
                            {value: 50, label: '50%'},
                            {value: 75, label: '75%'},
                            {value: 100, label: 'Max'},
                          ]}
                        />
                      </Box>
                    </Box>
                  )}
                </FormHelperText>
              </FormControl>
            </Box>
            <Box className={classes.tokenContainer} mt={1}>
              <Box className={classes.swapIconContainer}>
                {txId ? (
                  errorMessage ? (
                    <ErrorOutlineIcon className={classes.swapIcon} />
                  ) : (
                    <TaskAltIcon
                      className={cx(classes.swapIcon, {
                        [classes.successIcon]: isTxComplete,
                      })}
                    />
                  )
                ) : isLoading ? (
                  <CircularProgress
                    size="30px"
                    className={cx(classes.swapIcon, classes.loadingSpinner)}
                  />
                ) : (
                  <ArrowDownwardIcon className={classes.swapIcon} />
                )}
              </Box>
              <FormControl disabled={isLoading}>
                <ManageInput
                  id="destination-token-amount"
                  label={t('swap.receiveToken')}
                  placeholder={sourceTokenAmountMode === 'usd' ? '0.00' : '0'}
                  value={destinationTokenAmountStr || ''}
                  stacked={true}
                  disabled={isLoading}
                  classes={{
                    root: classes.tokenInputRoot,
                    input: classes.tokenInput,
                  }}
                  onChange={handleAmountChanged}
                  startAdornment={
                    sourceTokenAmountMode === 'usd' ? (
                      <Typography ml={2}>$</Typography>
                    ) : undefined
                  }
                  endAdornment={
                    <Box className={classes.tokenSelected}>
                      {destinationToken ? (
                        <Token
                          id="destination"
                          key={`destination-token-${destinationToken.swing.chain}-${destinationToken.swing.symbol}`}
                          token={getTokenEntry(destinationToken, true)}
                          hideBalance
                          isOwner
                          compact
                          mode={sourceTokenAmountMode}
                          iconWidth={6}
                          descriptionWidth={6}
                          graphWidth={0}
                          onClick={() => handleTokenClicked('destination')}
                        />
                      ) : (
                        <CircularProgress
                          size="30px"
                          className={classes.tokenLoading}
                        />
                      )}
                    </Box>
                  }
                />
              </FormControl>
            </Box>
          </Box>
        )}
        {txId && !errorMessage && (
          <Box className={classes.content}>
            <Button
              fullWidth
              variant="outlined"
              className={classes.button}
              onClick={handleTransactionClick}
            >
              {t('wallet.viewTransaction')}
            </Button>
            {destinationToken && onViewTokenClick && (
              <Button
                fullWidth
                variant="contained"
                className={classes.button}
                onClick={handleViewTokenClick}
              >
                {t('wallet.viewToken', {
                  symbol: getBlockchainDisplaySymbol(
                    destinationToken.tokenSymbol,
                  ),
                })}
              </Button>
            )}
          </Box>
        )}
        {errorMessage && (
          <Box mb={1}>
            <Alert
              data-testid="error-message"
              severity="error"
              action={
                errorMessage.toLowerCase().includes('refresh') ? (
                  <Button onClick={handleGetQuote} color="inherit" size="small">
                    {t('common.refresh')}
                  </Button>
                ) : undefined
              }
            >
              {errorMessage}
            </Alert>
          </Box>
        )}
        {isGettingQuote && sourceToken && destinationToken && (
          <Box mb={1}>
            <Alert severity="info">
              {t('swap.gettingQuote', {
                source: getBlockchainDisplaySymbol(sourceToken.tokenSymbol),
                destination: getBlockchainDisplaySymbol(
                  destinationToken.tokenSymbol,
                ),
              })}
            </Alert>
          </Box>
        )}
        {isInsufficientFunds && sourceToken && (
          <Box width="100%" mb={1}>
            <Alert severity="warning">
              {isInsufficientTokenFunds
                ? t(
                    sourceToken.swing.type === 'native'
                      ? 'swap.insufficientNativeBalance'
                      : 'swap.insufficientTokenBalance',
                    {
                      tokenSymbol: getBlockchainDisplaySymbol(
                        sourceToken.tokenSymbol,
                      ),
                    },
                  )
                : t('swap.insufficientGasBalance', {
                    tokenSymbol: getBlockchainDisplaySymbol(
                      sourceToken.tokenSymbol,
                    ),
                    gasSymbol: getBlockchainDisplaySymbol(
                      getBlockchainGasSymbol(sourceToken.chainSymbol),
                    ),
                  })}
            </Alert>
          </Box>
        )}
        {isSwapping &&
          !txId &&
          sourceToken &&
          destinationToken &&
          quoteSelected && (
            <Box mb={1}>
              <Alert severity="info">
                {t('swap.swapping', {
                  source: getBlockchainDisplaySymbol(sourceToken.tokenSymbol),
                  destination: getBlockchainDisplaySymbol(
                    destinationToken.tokenSymbol,
                  ),
                  minutes: quoteSelected.duration,
                  s: quoteSelected.duration > 1 ? 's' : '',
                })}
              </Alert>
            </Box>
          )}
        {!isButtonHidden && quoteSelected ? (
          <Box className={classes.content}>
            {sourceTokenAmountMode === 'native' &&
              getFeeSummaryTable(quoteSelected)}
            {isMultipleQuotes() && (
              <Button
                fullWidth
                size="small"
                variant="text"
                onClick={handleSwitchQuotes}
              >
                {isCheapestQuote(quoteSelected)
                  ? t('swap.tryFasterOption')
                  : t('swap.tryCheaperOption')}
              </Button>
            )}
            <Button
              data-testid="execute-swap-button"
              fullWidth
              variant="contained"
              onClick={handleSubmitTransaction}
              className={classes.button}
            >
              <Box display="flex" flexDirection="column" alignItems="center">
                <Typography variant="body1" fontWeight="bold">
                  {`${
                    sourceToken.tokenSymbol !== destinationToken.tokenSymbol
                      ? t('swap.swap')
                      : t('swap.bridge')
                  } ${
                    sourceTokenAmountMode === 'usd'
                      ? sourceTokenAmount
                          .toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          })
                          .replace('.00', '')
                      : sourceTokenAmount
                  } ${getBlockchainDisplaySymbol(sourceToken.tokenSymbol)}${
                    sourceToken.tokenSymbol !== destinationToken.tokenSymbol
                      ? ` ${t(
                          'common.to',
                        ).toLowerCase()} ${getBlockchainDisplaySymbol(
                          destinationToken.tokenSymbol,
                        )}`
                      : ''
                  }`}
                </Typography>
                {quoteSelected && (
                  <Typography variant="caption">
                    {getQuoteDescription(quoteSelected)}
                  </Typography>
                )}
              </Box>
            </Button>
          </Box>
        ) : (
          isSwitchModeButtonVisible && (
            <Box className={classes.content} mb={1}>
              <Button
                fullWidth
                variant="text"
                size="small"
                onClick={handleToggleMode}
                data-testid="switch-mode-button"
              >
                {sourceTokenAmountMode === 'usd'
                  ? t('swap.switchToNative')
                  : t('swap.switchToUsd')}
              </Button>
            </Box>
          )
        )}
      </Box>
      {tokenChooserOpen && (
        <Modal
          open={tokenChooserOpen}
          onClose={() => setTokenChooserOpen(false)}
          title={
            tokenChooserMode === 'source'
              ? t('swap.payWithToken')
              : t('swap.receiveToken')
          }
        >
          <SwapTokenModal
            getTokenEntry={getTokenEntry}
            mode={tokenChooserMode}
            walletTokens={
              tokenChooserMode === 'source' ? sourceTokens : destinationTokens
            }
            filterChain={
              tokenChooserMode === 'source'
                ? undefined
                : sourceToken?.swing.chain
            }
            isTokensLoading={isTokensLoading}
            onSelectedToken={handleTokenSelected}
          />
        </Modal>
      )}
    </Box>
  );
};

export default Swap;
