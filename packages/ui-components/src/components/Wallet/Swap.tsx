import type {IFireblocksNCW} from '@fireblocks/ncw-js-sdk';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import LoadingButton from '@mui/lab/LoadingButton';
// eslint-disable-next-line no-restricted-imports
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import MenuItem from '@mui/material/MenuItem';
import type {SelectChangeEvent} from '@mui/material/Select';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import Markdown from 'markdown-to-jsx';
import numeral from 'numeral';
import React, {useEffect, useRef, useState} from 'react';
import Animation from 'react-canvas-confetti/dist/presets/fireworks';
import {useDebounce} from 'usehooks-ts';

import config from '@unstoppabledomains/config';
import type {SwapConfig} from '@unstoppabledomains/config/build/src/env/types';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {
  createTransactionOperation,
  getOperationStatus,
} from '../../actions/fireBlocksActions';
import {
  getSwapQuoteV2,
  getSwapStatusV2,
  getSwapTokenV2,
  getSwapTransactionV2,
} from '../../actions/swingActionsV2';
import {useFireblocksState} from '../../hooks';
import type {
  CreateTransaction,
  SerializedWalletBalance,
  TokenEntry,
} from '../../lib';
import {
  TokenType,
  getBootstrapState,
  notifyEvent,
  useTranslationContext,
} from '../../lib';
import {FB_MAX_RETRY, FB_WAIT_TIME_MS} from '../../lib/fireBlocks/client';
import {pollForSuccess} from '../../lib/poll';
import type {GetOperationResponse} from '../../lib/types/fireBlocks';
import {OperationStatusType} from '../../lib/types/fireBlocks';
import type {RouteQuote, SwingV2QuoteRequest} from '../../lib/types/swingXyzV2';
import {getAsset} from '../../lib/wallet/asset';
import {getAllTokens} from '../../lib/wallet/evm/token';
import {localStorageWrapper} from '../Chat';
import ManageInput from '../Manage/common/ManageInput';
import {getBlockchainDisplaySymbol} from '../Manage/common/verification/types';
import FundWalletModal from './FundWalletModal';
import {TitleWithBackButton} from './TitleWithBackButton';
import Token from './Token';

const swapIntroFlag = 'swap-intro-flag';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    marginTop: theme.spacing(2),
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
  },
  noTokensContainer: {
    textAlign: 'center',
    height: '100%',
  },
  description: {
    textAlign: 'left',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(3),
  },
  dropDown: {
    padding: theme.spacing(0.5),
    minWidth: '150px',
  },
  button: {
    marginBottom: theme.spacing(1),
  },
  sliderContainer: {
    width: '100%',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(2),
  },
  tokenBalanceContainer: {
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
    color: theme.palette.neutralShades[600],
    minHeight: '20px',
  },
  tokenActionText: {
    color: theme.palette.primary.main,
    display: 'none',
  },
  swapIcon: {
    marginTop: theme.spacing(2),
    color: theme.palette.neutralShades[400],
    width: '50px',
    height: '50px',
  },
  loadingSpinner: {
    padding: theme.spacing(0.5),
  },
  successIcon: {
    color: theme.palette.success.main,
  },
}));

// internal type used to define a swap pair
type SwapToken = SwapConfig & {
  balance?: number;
  value?: number;
  walletAddress: string;
};

type Props = {
  onCancelClick: () => void;
  onClickReceive?: () => void;
  onClickBuy?: () => void;
  getClient: () => Promise<IFireblocksNCW>;
  accessToken: string;
  wallets: SerializedWalletBalance[];
};

const Swap: React.FC<Props> = ({
  onCancelClick,
  onClickBuy,
  onClickReceive,
  getClient,
  accessToken,
  wallets,
}) => {
  // page state
  const [t] = useTranslationContext();
  const {classes, cx} = useStyles();
  const isMounted = useRef(false);
  const [showSwapIntro, setShowSwapIntro] = useState(false);

  // fireblocks state
  const [state] = useFireblocksState();

  // operation state
  const [isGettingQuote, setIsGettingQuote] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [isTxComplete, setIsTxComplete] = useState(false);
  const [txId, setTxId] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();

  // swap pair state
  const [sliderValue, setSliderValue] = useState(0);
  const [sourceTokenAmountUsd, setSourceTokenAmountUsd] = useState(0);
  const sourceTokenAmountUsdDebounced = useDebounce<number>(
    sourceTokenAmountUsd,
    750,
  );
  const [sourceToken, setSourceToken] = useState<SwapToken>();
  const [sourceTokenDescription, setSourceTokenDescription] =
    useState<string>();
  const [destinationTokenAmountUsd, setDestinationTokenAmountUsd] = useState(0);
  const [destinationToken, setDestinationToken] = useState<SwapToken>();
  const [destinationTokenDescription, setDestinationTokenDescription] =
    useState<string>();

  // quote state
  const [quoteRequest, setQuoteRequest] = useState<SwingV2QuoteRequest>();
  const [quotes, setQuotes] = useState<RouteQuote[]>();

  // determines if button is visible
  const isButtonHidden =
    txId ||
    isTxComplete ||
    isSwapping ||
    isGettingQuote ||
    !!errorMessage ||
    !sourceToken ||
    !destinationToken ||
    !sourceTokenAmountUsd ||
    !quotes ||
    quotes.length === 0;

  // determines if the page is in loading state
  const isLoading = isGettingQuote || isSwapping;

  // build list of all available wallet tokens
  const allTokens = getAllTokens(wallets).filter(
    token => token.type === TokenType.Erc20 || token.type === TokenType.Native,
  );

  const getTokenEntry = (
    swapConfig: SwapConfig,
    placeholder?: boolean,
  ): TokenEntry | undefined => {
    const entry = allTokens.find(
      token =>
        token.walletName === swapConfig.chainName &&
        token.ticker === swapConfig.tokenSymbol,
    );
    if (entry) {
      return entry;
    }
    if (placeholder) {
      return {
        type: swapConfig.swing.type as TokenType,
        symbol: swapConfig.chainSymbol,
        ticker: swapConfig.tokenSymbol,
        name: swapConfig.chainName,
        imageUrl: swapConfig.imageUrl,
        walletName: swapConfig.chainName,
        walletAddress: '',
        walletBlockChainLink: '',
        tokenConversionUsd: 0,
        balance: 0,
        value: 0,
      };
    }
    return undefined;
  };

  // build list of supported source tokens with sufficient balance
  const sourceTokens: SwapToken[] =
    config.WALLETS.SWAP.SUPPORTED_TOKENS.SOURCE.filter(configToken =>
      getTokenEntry(configToken),
    )
      .map(configToken => {
        const walletToken = getTokenEntry(configToken)!;
        return {
          ...configToken,
          walletAddress: walletToken.walletAddress,
          balance: walletToken.balance,
          value: walletToken.value,
        };
      })
      .filter(token => token.balance && token.balance > 0)
      .filter(token => token.environment === config.APP_ENV)
      .sort(
        (a, b) =>
          b.value - a.value ||
          b.balance - a.balance ||
          a.chainName.localeCompare(b.chainName) ||
          a.tokenSymbol.localeCompare(b.tokenSymbol),
      );

  // build list of supported destination tokens
  const destinationTokens: SwapToken[] =
    config.WALLETS.SWAP.SUPPORTED_TOKENS.DESTINATION.map(configToken => {
      return {
        ...configToken,
        walletAddress:
          wallets.find(w => w.symbol === configToken.walletType)?.address || '',
      };
    })
      .map(configToken => {
        const walletToken = getTokenEntry(configToken)!;
        return {
          ...configToken,
          walletAddress:
            walletToken?.walletAddress || configToken.walletAddress,
          balance: walletToken?.balance,
          value: walletToken?.value,
        };
      })
      .filter(
        v =>
          `${v.swing.chain}/${v.swing.symbol}` !==
          `${sourceToken?.swing.chain}/${sourceToken?.swing.symbol}`,
      )
      .filter(
        token =>
          config.APP_ENV !== 'production' ||
          token.environment === config.APP_ENV,
      )
      .sort(
        (a, b) =>
          (b.value || 0) - (a.value || 0) ||
          (b.balance || 0) - (a.balance || 0) ||
          a.chainName.localeCompare(b.chainName) ||
          a.tokenSymbol.localeCompare(b.tokenSymbol),
      );

  useEffect(() => {
    // determine swap intro visibility
    const loadSwapIntro = async () => {
      const swapIntroState = await localStorageWrapper.getItem(swapIntroFlag);
      setShowSwapIntro(swapIntroState === null);
    };
    void loadSwapIntro();

    // determine mounted state
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // automatically select the first source token
  useEffect(() => {
    if (sourceToken) {
      return;
    }
    if (!sourceTokens || sourceTokens.length === 0) {
      return;
    }
    setSourceToken(sourceTokens[0]);
  }, [sourceToken, sourceTokens]);

  // automatically select the first destination token
  useEffect(() => {
    if (destinationToken) {
      return;
    }
    if (!sourceToken || !destinationTokens || destinationTokens.length === 0) {
      return;
    }
    setDestinationToken(destinationTokens[0]);
  }, [sourceToken, destinationToken, destinationTokens]);

  // retrieve quote when a swap pair is selected
  useEffect(() => {
    if (!sourceTokenAmountUsdDebounced || !sourceToken || !destinationToken) {
      return;
    }

    // set the slider amount
    const tokenEntry = getTokenEntry(sourceToken);
    if (tokenEntry) {
      const pctValue = Math.floor(
        100 * (sourceTokenAmountUsdDebounced / tokenEntry.value),
      );
      if (sliderValue !== pctValue) {
        setSliderValue(pctValue);
      }
    }

    // get the quote
    void handleGetQuote();
  }, [sourceTokenAmountUsdDebounced, sourceToken, destinationToken]);

  const handleSwapInfoClicked = async () => {
    setShowSwapIntro(false);
    await localStorageWrapper.setItem(swapIntroFlag, swapIntroFlag);
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

  const handleSliderChange = (_e: Event, v: number | number[]) => {
    if (!sourceToken) {
      return;
    }
    const tokenEntry = getTokenEntry(sourceToken);
    if (!tokenEntry) {
      return;
    }

    // reset quote state
    setIsTxComplete(false);
    setTxId(undefined);
    setQuotes(undefined);
    setErrorMessage(undefined);
    setDestinationTokenAmountUsd(0);
    setSourceTokenDescription(undefined);
    setDestinationTokenDescription(undefined);

    // set the form elements
    const pctSelected = v as number;
    const valueSelected = tokenEntry.value * (pctSelected / 100);
    setSliderValue(pctSelected);
    setSourceTokenAmountUsd(parseFloat(numeral(valueSelected).format('0.')));
  };

  const handleSourceChange = (event: SelectChangeEvent) => {
    setIsTxComplete(false);
    setTxId(undefined);
    setErrorMessage(undefined);
    setDestinationTokenAmountUsd(0);
    setSourceTokenDescription(undefined);
    setDestinationTokenDescription(undefined);
    setSourceToken(
      sourceTokens.find(
        v => `${v.swing.chain}/${v.swing.symbol}` === event.target.value,
      ),
    );
  };

  const handleDestinationChange = async (event: SelectChangeEvent) => {
    setIsTxComplete(false);
    setTxId(undefined);
    setQuotes(undefined);
    setErrorMessage(undefined);
    setDestinationToken(
      destinationTokens.find(
        v => `${v.swing.chain}/${v.swing.symbol}` === event.target.value,
      ),
    );
    setDestinationTokenAmountUsd(0);
    setSourceTokenDescription(undefined);
    setDestinationTokenDescription(undefined);
  };

  const handleAmountChanged = async (id: string, v: string) => {
    setIsTxComplete(false);
    setTxId(undefined);
    setQuotes(undefined);
    setErrorMessage(undefined);
    setDestinationTokenAmountUsd(0);
    setSourceTokenDescription(undefined);
    setDestinationTokenDescription(undefined);
    try {
      const parsedValue = parseFloat(v.replaceAll('$', ''));
      if (parsedValue) {
        setSourceTokenAmountUsd(parsedValue);
        setDestinationTokenAmountUsd(parsedValue);
        return;
      }
    } catch (e) {}
    setSourceTokenAmountUsd(0);
    setDestinationTokenAmountUsd(0);
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
    setSourceTokenDescription(undefined);
    setDestinationTokenDescription(undefined);

    // retrieve swap token definitions
    try {
      const [swapTokenSource, swapTokenDestination] = await Promise.all([
        getSwapTokenV2(sourceToken.swing.chain, sourceToken.swing.symbol),
        getSwapTokenV2(
          destinationToken.swing.chain,
          destinationToken.swing.symbol,
        ),
      ]);
      if (!swapTokenSource || !swapTokenDestination) {
        setErrorMessage(
          t('swap.pairNotSupported', {
            source: sourceToken.swing.symbol,
            destination: destinationToken.swing.symbol,
          }),
        );
        return;
      }

      // ensure the source token price is populated
      if (!swapTokenSource.price) {
        const walletToken = allTokens.find(
          token => token.symbol === swapTokenSource.symbol,
        );
        if (!walletToken?.value || !walletToken?.balance) {
          throw new Error('source token price not found');
        }
        swapTokenSource.price = walletToken.value / walletToken.balance;
      }

      // determine amount based on market price and token decimals
      const sourceAmt = sourceTokenAmountUsd / swapTokenSource.price;
      const sourceAmountInDecimals = Math.floor(
        sourceAmt * Math.pow(10, swapTokenSource.decimals),
      );

      // create a quote request and query the swap service
      const request: SwingV2QuoteRequest = {
        // information about source token
        fromChain: swapTokenSource.chain,
        fromTokenAddress: swapTokenSource.address,
        fromUserAddress: sourceToken.walletAddress,
        tokenSymbol: swapTokenSource.symbol,
        tokenAmount: String(sourceAmountInDecimals),

        // information about destination token
        toChain: swapTokenDestination.chain,
        toTokenAddress: swapTokenDestination.address,
        toTokenSymbol: swapTokenDestination.symbol,
        toUserAddress: destinationToken.walletAddress,
      };
      const quotesResponse = await getSwapQuoteV2(request);
      setQuoteRequest(request);

      // validate result
      if (!quotesResponse?.routes || quotesResponse.routes.length === 0) {
        setErrorMessage(t('swap.noQuoteAvailable'));
        return;
      }

      // store quotes sorted by time, price impact and fees
      quotesResponse.routes = quotesResponse.routes.sort((a, b) => {
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
      setQuotes(quotesResponse.routes);

      // set quote amounts for each token
      setSourceTokenDescription(
        `${t('swap.pay')} **${new Intl.NumberFormat('en-US', {
          maximumSignificantDigits: 4,
        }).format(sourceAmt)}** ${getBlockchainDisplaySymbol(
          sourceToken.swing.symbol,
        )}`,
      );
      const destinationTokenBalance =
        parseFloat(quotesResponse.routes[0].quote.amount) /
        Math.pow(10, quotesResponse.routes[0].quote.decimals);
      setDestinationTokenDescription(
        `${t('swap.receive')} **${new Intl.NumberFormat('en-US', {
          maximumSignificantDigits: 4,
        }).format(destinationTokenBalance)}** ${getBlockchainDisplaySymbol(
          destinationToken.swing.symbol,
        )}`,
      );
      const destinationUsd =
        quotesResponse.routes[0].quote.amountUSD &&
        parseFloat(quotesResponse.routes[0].quote.amountUSD)
          ? parseFloat(quotesResponse.routes[0].quote.amountUSD)
          : swapTokenSource.symbol === swapTokenDestination.symbol
          ? swapTokenSource.price * destinationTokenBalance
          : 0;
      setDestinationTokenAmountUsd(
        parseFloat(numeral(destinationUsd).format('0.00')),
      );
    } catch (e) {
      notifyEvent(e, 'error', 'Wallet', 'Transaction', {
        msg: 'error retrieving swap quote',
      });
    } finally {
      setIsGettingQuote(false);
    }
  };

  const handleSubmitTransaction = async () => {
    if (!quoteRequest || !quotes || quotes.length === 0) {
      return;
    }

    try {
      // retrieve and validate fireblocks state
      setIsSwapping(true);
      const clientState = getBootstrapState(state);
      if (!clientState) {
        throw new Error('invalid wallet client state');
      }

      // request the transaction details required to swap
      const txResponse = await getSwapTransactionV2({
        ...quoteRequest,
        integration: quotes[0].quote.integration,
        toTokenAmount: quotes[0].quote.amount,
        type: quotes[0].quote.type,
        route: quotes[0].route,
      });

      // validate the response
      if (!txResponse?.tx) {
        throw new Error('SwingError: swap transaction details not found');
      }
      if (txResponse.error && txResponse.message) {
        throw new Error(
          `SwingError: ${txResponse.error}, ${txResponse.message}`,
        );
      }

      // retrieve and validate the asset required to sign this message
      const asset = getAsset(clientState.assets, {
        chainId: txResponse.fromChain.chainId,
      });
      if (!asset?.accountId) {
        throw new Error('error retrieving source asset from wallet state');
      }

      // create and validate the swap transaction
      const swapTx: CreateTransaction = {
        chainId: txResponse.fromChain.chainId,
        to: txResponse.tx.to,
        data: txResponse.tx.data,
        value: txResponse.tx.value,
      };
      const operationResponse = await createTransactionOperation(
        accessToken,
        asset.accountId,
        asset.id,
        swapTx,
      );
      if (!operationResponse) {
        throw new Error('error creating MPC transaction for swap');
      }

      // sign the swap transaction
      await pollForSignature(txResponse.id, operationResponse);
      await pollForCompletion(txResponse.id, operationResponse);
    } catch (e) {
      setErrorMessage(t('swap.errorSwappingTokens'));
      notifyEvent(e, 'error', 'Wallet', 'Transaction', {
        msg: 'error creating swap transaction',
      });
    } finally {
      setIsSwapping(false);
    }
  };

  const pollForSignature = async (
    swingId: number,
    operationResponse: GetOperationResponse,
  ) => {
    const result = await pollForSuccess({
      fn: async () => {
        if (!isMounted.current) {
          throw new Error('Transaction cancelled by user');
        }
        const operationStatus = await getOperationStatus(
          accessToken,
          operationResponse.operation.id,
        );
        if (operationStatus.transaction?.id) {
          // retrieve the swing transaction status, which is an important step in
          // registering the transaction on the Swing dashboard
          await getSwapStatusV2(swingId, operationStatus.transaction.id);
        }
        if (
          !operationStatus ||
          operationStatus.status === OperationStatusType.FAILED
        ) {
          throw new Error('Error requesting transaction operation status');
        }
        if (
          operationStatus.status === OperationStatusType.SIGNATURE_REQUIRED &&
          operationStatus.transaction?.externalVendorTransactionId
        ) {
          const client = await getClient();
          await client.signTransaction(
            operationStatus.transaction.externalVendorTransactionId,
          );
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
    swingId: number,
    operationResponse: GetOperationResponse,
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

        // handle transaction ID
        if (operationStatus.transaction?.id) {
          // set transaction ID
          setTxId(operationStatus.transaction.id);

          // retrieve the swing transaction status, which is an important step in
          // registering the transaction on the Swing dashboard
          const swingStatus = await getSwapStatusV2(
            swingId,
            operationStatus.transaction.id,
          );
          if (swingStatus?.status?.toLowerCase() === 'failed') {
            throw new Error(
              `Swap failed: ${
                swingStatus?.reason || operationStatus.status.toLowerCase()
              }`,
            );
          } else if (swingStatus?.status?.toLowerCase() !== 'success') {
            return {success: false};
          }
        }

        // handle operation status success
        if (operationStatus.status === OperationStatusType.COMPLETED) {
          setIsSwapping(false);
          setIsTxComplete(true);
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

  const getQuoteDescription = (q: RouteQuote) => {
    // calculate fee total
    const quoteFee = q.quote.fees
      .map(f => parseFloat(f.amountUSD))
      .reduce((a, b) => a + b, 0);

    // calculate price impact
    const priceImpact = sourceTokenAmountUsd - destinationTokenAmountUsd;

    return `${
      priceImpact > 0 || quoteFee > 0
        ? `${(priceImpact + quoteFee).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          })} ${t('wallet.networkFee').toLowerCase()} / `
        : ''
    }~ ${q.duration} ${t('common.minute')}${q.duration > 1 ? 's' : ''}`;
  };

  return (
    <Box className={classes.flexColCenterAligned}>
      <TitleWithBackButton
        onCancelClick={onCancelClick}
        label={t('swap.description')}
      />
      <Box className={classes.container}>
        {allTokens.length > 0 &&
        sourceTokens.length === 0 &&
        onClickBuy &&
        onClickReceive ? (
          <Box className={classes.noTokensContainer}>
            <FundWalletModal
              onBuyClicked={onClickBuy}
              onReceiveClicked={onClickReceive}
            />
          </Box>
        ) : (
          <Box className={classes.content}>
            {showSwapIntro && (
              <Alert
                severity="info"
                className={classes.description}
                onClose={handleSwapInfoClicked}
              >
                <AlertTitle>{t('swap.introTitle')}</AlertTitle>
                {t('swap.introContent')}
              </Alert>
            )}
            <FormControl disabled={isLoading}>
              <ManageInput
                id="source-token-amount"
                label={t('swap.payWithToken')}
                placeholder="0.00"
                value={
                  sourceTokenAmountUsd ? sourceTokenAmountUsd.toString() : ''
                }
                stacked={true}
                disabled={isLoading}
                onChange={handleAmountChanged}
                startAdornment={<Typography ml={2}>$</Typography>}
                endAdornment={
                  <Select
                    size="small"
                    id="source-token"
                    disabled={isLoading}
                    value={
                      sourceToken
                        ? `${sourceToken.swing.chain}/${sourceToken.swing.symbol}`
                        : ''
                    }
                    onChange={handleSourceChange}
                    className={classes.dropDown}
                    variant="standard"
                    disableUnderline
                  >
                    {sourceTokens
                      .filter(v => getTokenEntry(v))
                      .map(v => (
                        <MenuItem
                          key={`source-${v.swing.chain}/${v.swing.symbol}`}
                          value={`${v.swing.chain}/${v.swing.symbol}`}
                        >
                          <Token
                            key={`source-token-${v.swing.chain}/${v.swing.symbol}`}
                            token={getTokenEntry(v)!}
                            hideBalance
                            isOwner
                            compact
                            iconWidth={6}
                            descriptionWidth={6}
                            graphWidth={0}
                          />
                        </MenuItem>
                      ))}
                  </Select>
                }
              />
              <FormHelperText className={classes.tokenBalanceContainer}>
                <Box display="flex" justifyContent="space-between" width="100%">
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
              </FormHelperText>
            </FormControl>
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
                size="50px"
                className={cx(classes.swapIcon, classes.loadingSpinner)}
              />
            ) : (
              <ImportExportIcon className={classes.swapIcon} />
            )}
            <FormControl disabled={isLoading}>
              <ManageInput
                id="destination-token-amount"
                label={t('swap.receiveToken')}
                placeholder="0.00"
                value={
                  destinationTokenAmountUsd
                    ? destinationTokenAmountUsd.toString()
                    : ''
                }
                stacked={true}
                disabled={isLoading}
                onChange={handleAmountChanged}
                startAdornment={<Typography ml={2}>$</Typography>}
                endAdornment={
                  <Select
                    size="small"
                    id="destination-token"
                    disabled={isLoading}
                    value={
                      destinationToken
                        ? `${destinationToken.swing.chain}/${destinationToken.swing.symbol}`
                        : ''
                    }
                    onChange={handleDestinationChange}
                    className={classes.dropDown}
                    variant="standard"
                    disableUnderline
                  >
                    {destinationTokens
                      .filter(v => getTokenEntry(v, true))
                      .map(v => (
                        <MenuItem
                          key={`destination-${v.swing.chain}/${v.swing.symbol}`}
                          value={`${v.swing.chain}/${v.swing.symbol}`}
                        >
                          <Token
                            key={`destination-token-${v.swing.chain}/${v.swing.symbol}`}
                            token={getTokenEntry(v, true)!}
                            hideBalance
                            isOwner
                            compact
                            iconWidth={6}
                            descriptionWidth={6}
                            graphWidth={0}
                          />
                        </MenuItem>
                      ))}
                  </Select>
                }
              />
              <FormHelperText className={classes.tokenBalanceContainer}>
                <Box className={classes.tokenActionText}>
                  <Markdown>{destinationTokenDescription || ''}</Markdown>
                </Box>
              </FormHelperText>
            </FormControl>
          </Box>
        )}
        {txId && !errorMessage && (
          <Box>
            <Button
              fullWidth
              variant="outlined"
              className={classes.button}
              onClick={handleTransactionClick}
            >
              {t('wallet.viewTransaction')}
            </Button>
          </Box>
        )}
        {isTxComplete && <Animation autorun={{speed: 3, duration: 1}} />}
        {errorMessage && (
          <Box mb={1}>
            <Alert
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
                source: sourceToken.swing.symbol,
                destination: destinationToken.swing.symbol,
              })}
            </Alert>
          </Box>
        )}
        {isSwapping && !txId && sourceToken && destinationToken && quotes && (
          <Box mb={1}>
            <Alert severity="info">
              {t('swap.swapping', {
                source: sourceToken.swing.symbol,
                destination: destinationToken.swing.symbol,
                minutes: quotes[0].duration,
                s: quotes[0].duration > 1 ? 's' : '',
              })}
            </Alert>
          </Box>
        )}
        {!isButtonHidden && (
          <LoadingButton
            fullWidth
            variant="contained"
            onClick={handleSubmitTransaction}
            className={classes.button}
            loading={isLoading}
          >
            <Box display="flex" flexDirection="column" alignItems="center">
              <Typography variant="body1" fontWeight="bold">
                {`${
                  sourceToken.swing.symbol !== destinationToken.swing.symbol
                    ? t('swap.swap')
                    : t('swap.bridge')
                } ${sourceTokenAmountUsd
                  .toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })
                  .replace('.00', '')} ${getBlockchainDisplaySymbol(
                  sourceToken.swing.symbol,
                )}${
                  sourceToken.swing.symbol !== destinationToken.swing.symbol
                    ? ` ${t(
                        'common.to',
                      ).toLowerCase()} ${getBlockchainDisplaySymbol(
                        destinationToken.swing.symbol,
                      )}`
                    : ''
                }`}
              </Typography>
              {quotes && (
                <Typography variant="caption">
                  {getQuoteDescription(quotes[0])}
                </Typography>
              )}
            </Box>
          </LoadingButton>
        )}
      </Box>
    </Box>
  );
};

export default Swap;
