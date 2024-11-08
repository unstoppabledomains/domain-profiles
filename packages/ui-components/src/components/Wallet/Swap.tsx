import type {IFireblocksNCW} from '@fireblocks/ncw-js-sdk';
import CheckIcon from '@mui/icons-material/Check';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import LoadingButton from '@mui/lab/LoadingButton';
// eslint-disable-next-line no-restricted-imports
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import MenuItem from '@mui/material/MenuItem';
import type {SelectChangeEvent} from '@mui/material/Select';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {capitalize} from 'lodash';
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
  getSwapQuote,
  getSwapToken,
  getSwapTransaction,
} from '../../actions/swapActions';
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
import type {RouteQuote, SwingQuoteRequest} from '../../lib/types/swingXyz';
import {getAsset} from '../../lib/wallet/asset';
import {getAllTokens} from '../../lib/wallet/evm/token';
import ManageInput from '../Manage/common/ManageInput';
import {getBlockchainDisplaySymbol} from '../Manage/common/verification/types';
import FundWalletModal from './FundWalletModal';
import {TitleWithBackButton} from './TitleWithBackButton';
import Token from './Token';

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
    marginBottom: theme.spacing(2),
  },
  dropDown: {
    padding: theme.spacing(0.5),
    minWidth: '150px',
  },
  button: {
    marginBottom: theme.spacing(1),
  },
  tokenBalanceContainer: {
    marginLeft: theme.spacing(0),
    marginRight: theme.spacing(0),
    color: theme.palette.neutralShades[600],
    height: '20px',
  },
  tokenActionText: {
    color: theme.palette.primary.main,
  },
  swapIcon: {
    color: theme.palette.neutralShades[400],
    width: '40px',
    height: '40px',
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
  // page state
  const [t] = useTranslationContext();
  const {classes} = useStyles();
  const isMounted = useRef(false);

  // fireblocks state
  const [state] = useFireblocksState();

  // operation state
  const [isGettingQuote, setIsGettingQuote] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txId, setTxId] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();

  // swap pair state
  const [sourceTokenAmountUsd, setSourceTokenAmountUsd] = useState(0);
  const sourceTokenAmountUsdDebounced = useDebounce<number>(
    sourceTokenAmountUsd,
    500,
  );
  const [sourceToken, setSourceToken] = useState<SwapToken>();
  const [sourceTokenDescription, setSourceTokenDescription] =
    useState<string>();
  const [destinationTokenAmountUsd, setDestinationTokenAmountUsd] = useState(0);
  const [destinationToken, setDestinationToken] = useState<SwapToken>();
  const [destinationTokenDescription, setDestinationTokenDescription] =
    useState<string>();

  // quote state
  const [quoteRequest, setQuoteRequest] = useState<SwingQuoteRequest>();
  const [quotes, setQuotes] = useState<RouteQuote[]>();

  // determines if button is disabled
  const isDisabled =
    isSuccess ||
    !!errorMessage ||
    !sourceToken ||
    !destinationToken ||
    !sourceTokenAmountUsd ||
    !quotes ||
    quotes.length === 0;

  // build list of all available wallet tokens
  const allTokens = getAllTokens(wallets).filter(
    token =>
      (supportErc20 && token.type === TokenType.Erc20) ||
      token.type === TokenType.Native,
  );

  const getTokenEntry = (
    swapConfig: SwapConfig,
    placeholder?: boolean,
  ): TokenEntry | undefined => {
    const entry = allTokens.find(
      token =>
        token.walletName === swapConfig.chainName &&
        token.symbol === swapConfig.tokenSymbol,
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
      .sort((a, b) => b.value - a.value || b.balance - a.balance);

  // build list of supported destination tokens
  const destinationTokens: SwapToken[] =
    config.WALLETS.SWAP.SUPPORTED_TOKENS.DESTINATION.map(configToken => {
      return {
        ...configToken,
        walletAddress: wallets.find(w => w.symbol === configToken.walletType)!
          .address,
      };
    }).filter(
      v =>
        `${v.swing.chain}/${v.swing.symbol}` !==
        `${sourceToken?.swing.chain}/${sourceToken?.swing.symbol}`,
    );

  // determine mounted state
  useEffect(() => {
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
    void handleGetQuote();
  }, [sourceTokenAmountUsdDebounced, sourceToken, destinationToken]);

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

  const handleSourceChange = (event: SelectChangeEvent) => {
    setIsSuccess(false);
    setTxId(undefined);
    setErrorMessage(undefined);
    setSourceToken(
      sourceTokens.find(
        v => `${v.swing.chain}/${v.swing.symbol}` === event.target.value,
      ),
    );
    setDestinationTokenAmountUsd(0);
    setSourceTokenDescription(undefined);
    setDestinationTokenDescription(undefined);
  };

  const handleDestinationChange = async (event: SelectChangeEvent) => {
    setIsSuccess(false);
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
    setIsSuccess(false);
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
      setErrorMessage('Choose tokens to swap');
      return;
    }

    // reset state
    setIsGettingQuote(true);
    setErrorMessage(undefined);
    setSourceTokenDescription(undefined);
    setDestinationTokenDescription(undefined);

    // retrieve swap token definitions
    try {
      const [swapTokenSource, swapTokenDestination] = await Promise.all([
        getSwapToken(sourceToken.swing.chain, sourceToken.swing.symbol),
        getSwapToken(
          destinationToken.swing.chain,
          destinationToken.swing.symbol,
        ),
      ]);
      if (!swapTokenSource || !swapTokenDestination) {
        setErrorMessage('Error retrieving token details');
        return;
      }

      // ensure the source token price is populated
      if (!swapTokenSource.price) {
        const walletToken = allTokens.find(
          token => token.symbol === swapTokenSource.symbol,
        );
        if (!walletToken) {
          setErrorMessage(
            `Error determining ${swapTokenSource.symbol} token price`,
          );
          return;
        }
        swapTokenSource.price = walletToken.value / walletToken.balance;
      }

      // determine amount based on market price and token decimals
      const sourceAmt = sourceTokenAmountUsd / swapTokenSource.price;
      const sourceAmountInDecimals = Math.floor(
        sourceAmt * Math.pow(10, swapTokenSource.decimals),
      );

      // create a quote request and query the swap service
      const request: SwingQuoteRequest = {
        // information about source token
        fromChain: swapTokenSource.chain,
        fromChainDecimal: swapTokenSource.decimals,
        fromTokenAddress: swapTokenSource.address,
        fromUserAddress: sourceToken.walletAddress,
        tokenSymbol: swapTokenSource.symbol,
        tokenAmount: String(sourceAmountInDecimals),

        // information about destination token
        toChain: swapTokenDestination.chain,
        toChainDecimal: swapTokenDestination.decimals,
        toTokenAddress: swapTokenDestination.address,
        toTokenSymbol: swapTokenDestination.symbol,
        toUserAddress: destinationToken.walletAddress,
      };
      const quotesResponse = await getSwapQuote(request);
      setQuoteRequest(request);

      // validate result
      if (!quotesResponse?.routes || quotesResponse.routes.length === 0) {
        setErrorMessage('No quotes available');
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
        `Pay ~**${new Intl.NumberFormat('en-US', {
          maximumSignificantDigits: 6,
        }).format(sourceAmt)}** ${getBlockchainDisplaySymbol(
          sourceToken.swing.symbol,
        )}`,
      );
      const destinationTokenBalance =
        parseFloat(quotesResponse.routes[0].quote.amount) /
        Math.pow(10, quotesResponse.routes[0].quote.decimals);
      setDestinationTokenDescription(
        `Receive ~**${new Intl.NumberFormat('en-US', {
          maximumSignificantDigits: 6,
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
      // request the transaction details required to swap
      setIsSwapping(true);
      const txResponse = await getSwapTransaction(quoteRequest, quotes[0]);

      // validate the response
      if (!txResponse?.tx) {
        setErrorMessage('Error creating transaction');
        return;
      }
      if (txResponse.error && txResponse.message) {
        setErrorMessage(capitalize(txResponse.message));
        return;
      }

      // retrieve and validate fireblocks state
      const clientState = getBootstrapState(state);
      if (!clientState) {
        setErrorMessage('Error retrieving wallet state');
        return;
      }

      // retrieve and validate the asset required to sign this message
      const asset = getAsset(clientState.assets, {
        chainId: txResponse.fromChain.chainId,
      });
      if (!asset?.accountId) {
        setErrorMessage('Error finding signing asset');
        return;
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
        setErrorMessage('Error creating swap transaction');
        return;
      }

      // sign the swap transaction
      await pollForSignature(operationResponse);
      await pollForCompletion(operationResponse);
    } catch (e) {
      setErrorMessage('Error swapping tokens');
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

  const pollForCompletion = async (operationResponse: GetOperationResponse) => {
    const result = await pollForSuccess({
      fn: async () => {
        const operationStatus = await getOperationStatus(
          accessToken,
          operationResponse.operation.id,
        );
        if (!operationStatus) {
          throw new Error('Error requesting transaction operation status');
        }
        if (operationStatus.transaction?.id) {
          setTxId(operationStatus.transaction.id);
        }
        if (
          operationStatus.status === OperationStatusType.FAILED ||
          operationStatus.status === OperationStatusType.CANCELLED
        ) {
          throw new Error(
            `Transferred failed ${operationStatus.status.toLowerCase()}`,
          );
        }
        if (operationStatus.status === OperationStatusType.COMPLETED) {
          setIsSwapping(false);
          setIsSuccess(true);
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
        ? `${(priceImpact || quoteFee).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          })} network fee / `
        : ''
    }~ ${q.duration} minute${q.duration > 1 ? 's' : ''}`;
  };

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
          <FormControl disabled={isGettingQuote || isSwapping}>
            <ManageInput
              id="source-token-amount"
              label="Pay with token"
              placeholder="0.00"
              value={
                sourceTokenAmountUsd ? sourceTokenAmountUsd.toString() : ''
              }
              stacked={true}
              onChange={handleAmountChanged}
              startAdornment={<Typography ml={2}>$</Typography>}
              endAdornment={
                <Select
                  size="small"
                  id="source-token"
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
                      <MenuItem value={`${v.swing.chain}/${v.swing.symbol}`}>
                        <Token
                          token={getTokenEntry(v)!}
                          isOwner
                          hideBalance
                          iconWidth={5}
                          descriptionWidth={7}
                        />
                      </MenuItem>
                    ))}
                </Select>
              }
            />
            <FormHelperText className={classes.tokenBalanceContainer}>
              <Box display="flex" justifyContent="space-between" width="100%">
                <Box className={classes.tokenActionText}>
                  <Markdown>{sourceTokenDescription || ''}</Markdown>
                </Box>
                {sourceToken && (
                  <Box>
                    <b>
                      {numeral(getTokenEntry(sourceToken)?.balance).format(
                        '0.[000000]',
                      )}
                    </b>{' '}
                    {getBlockchainDisplaySymbol(sourceToken.tokenSymbol)} /{' '}
                    <b>
                      {getTokenEntry(sourceToken)?.value.toLocaleString(
                        'en-US',
                        {
                          style: 'currency',
                          currency: 'USD',
                        },
                      )}
                    </b>
                  </Box>
                )}
              </Box>
            </FormHelperText>
          </FormControl>
          <ImportExportIcon className={classes.swapIcon} />
          <FormControl disabled={!sourceToken || isGettingQuote || isSwapping}>
            <ManageInput
              id="destination-token-amount"
              label="Receive token"
              placeholder="0.00"
              value={
                destinationTokenAmountUsd
                  ? destinationTokenAmountUsd.toString()
                  : ''
              }
              stacked={true}
              onChange={handleAmountChanged}
              startAdornment={<Typography ml={2}>$</Typography>}
              endAdornment={
                <Select
                  size="small"
                  id="destination-token"
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
                      <MenuItem value={`${v.swing.chain}/${v.swing.symbol}`}>
                        <Token
                          token={getTokenEntry(v, true)!}
                          isOwner
                          hideBalance
                          iconWidth={5}
                          descriptionWidth={7}
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
        {txId && (
          <Button
            className={classes.button}
            variant="text"
            onClick={handleTransactionClick}
          >
            View Transaction
          </Button>
        )}
        <LoadingButton
          fullWidth
          variant="contained"
          onClick={handleSubmitTransaction}
          disabled={isDisabled}
          className={classes.button}
          loading={isGettingQuote || isSwapping}
          loadingIndicator={
            <Box display="flex" alignItems="center" p={1}>
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
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            p={isDisabled ? 1 : undefined}
          >
            <Typography variant="body1" fontWeight="bold">
              {errorMessage ? (
                errorMessage
              ) : isSuccess ? (
                <Box display="flex" alignItems="center">
                  <CheckIcon />
                  <Box ml={1}>Success!</Box>
                </Box>
              ) : isDisabled ? (
                'Select tokens and amount'
              ) : (
                `${
                  sourceToken.swing.symbol !== destinationToken.swing.symbol
                    ? 'Swap'
                    : 'Bridge'
                } ${sourceTokenAmountUsd
                  .toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })
                  .replace('.00', '')} ${getBlockchainDisplaySymbol(
                  sourceToken.swing.symbol,
                )}${
                  sourceToken.swing.symbol !== destinationToken.swing.symbol
                    ? ` to ${getBlockchainDisplaySymbol(
                        destinationToken.swing.symbol,
                      )}`
                    : ''
                }`
              )}
            </Typography>
            {quotes && !isDisabled && (
              <Typography variant="caption">
                {getQuoteDescription(quotes[0])}
              </Typography>
            )}
          </Box>
        </LoadingButton>
        {isSuccess && <Animation autorun={{speed: 3, duration: 1}} />}
      </Box>
    </Box>
  );
};

export default Swap;
