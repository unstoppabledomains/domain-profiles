import type {IFireblocksNCW} from '@fireblocks/ncw-js-sdk';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useRef, useState} from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useFeatureFlags} from '../../actions';
import {
  getTransactionGasEstimate,
  getTransferGasEstimate,
} from '../../actions/fireBlocksActions';
import {prepareRecipientWallet} from '../../actions/walletActions';
import {useFireblocksState} from '../../hooks';
import type {SerializedWalletBalance, TokenEntry} from '../../lib';
import {TokenType, getBootstrapState, useTranslationContext} from '../../lib';
import {sleep} from '../../lib/sleep';
import type {AccountAsset} from '../../lib/types/fireBlocks';
import {getAsset} from '../../lib/wallet/asset';
import {createErc20TransferTx} from '../../lib/wallet/evm/token';
import {isEthAddress} from '../Chat/protocol/resolution';
import {getBlockchainDisplaySymbol} from '../Manage/common/verification/types';
import AddressInput from './AddressInput';
import AmountInput from './AmountInput';
import {OperationStatus} from './OperationStatus';
import {SelectAsset} from './SelectAsset';
import SendConfirm from './SendConfirm';
import SubmitTransaction from './SubmitTransaction';
import {TitleWithBackButton} from './TitleWithBackButton';

const useStyles = makeStyles()((theme: Theme) => ({
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
  fullWidth: {
    width: '100%',
  },
  contentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '250px',
    width: '100%',
    height: '100%',
  },
  selectAssetContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '250px',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
  },
  loaderContainer: {
    display: 'flex',
    height: '28em',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
    height: '70px',
    width: '70px',
    marginTop: '10px',
    borderRadius: '50%',
    boxShadow: theme.shadows[6],
  },
  sendAssetContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  sendAmountContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '113px',
  },
  recipientWrapper: {
    minHeight: '109px',
    width: '100%',
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
  footer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'space-between',
  },
}));

type Props = {
  onCancelClick: () => void;
  onClickReceive?: () => void;
  onClickBuy?: () => void;
  getClient: () => Promise<IFireblocksNCW>;
  accessToken: string;
  wallets: SerializedWalletBalance[];
  initialSelectedToken?: TokenEntry;
};

const Send: React.FC<Props> = ({
  onCancelClick,
  onClickBuy,
  onClickReceive,
  getClient,
  accessToken,
  wallets,
  initialSelectedToken,
}) => {
  const [t] = useTranslationContext();
  const [state] = useFireblocksState();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [accountAsset, setAccountAsset] = useState<AccountAsset>();
  const [selectedToken, setSelectedToken] = useState<TokenEntry>();
  const [amount, setAmount] = useState('');
  const [transactionSubmitted, setTransactionSubmitted] = useState(false);
  const [sendConfirmation, setSendConfirmation] = useState(false);
  const [resolvedDomain, setResolvedDomain] = useState('');
  const [gasFeeEstimate, setGasFeeEstimate] = useState('');
  const {classes, cx} = useStyles();
  const amountInputRef = useRef<HTMLInputElement>(null);

  // determine feature flags for this wallet instance
  const {data: featureFlags} = useFeatureFlags(
    false,
    wallets?.find(w => isEthAddress(w.address))?.address,
  );
  const isSendToEmailEnabled =
    featureFlags.variations?.profileServiceEnableWalletCreation === true &&
    featureFlags.variations?.profileServiceEnableWalletSendToEmail === true;
  const isSplTokenEnabled =
    featureFlags.variations?.udMeEnableWalletSolanaSigning;

  useEffect(() => {
    if (!initialSelectedToken) {
      return;
    }
    handleSelectToken(initialSelectedToken);
  }, [initialSelectedToken]);

  const resetForm = () => {
    setResolvedDomain('');
    setRecipientAddress('');
    setAmount('');
    setSendConfirmation(false);
    setAccountAsset(undefined);
    setSelectedToken(undefined);
  };

  const handleBackClick = () => {
    if (!selectedToken || initialSelectedToken) {
      onCancelClick();
    }
    if (!transactionSubmitted && sendConfirmation) {
      setSendConfirmation(false);
      return;
    }
    resetForm();
  };

  const handleSelectToken = async (token: TokenEntry) => {
    // retrieve client state
    setSelectedToken(token);
    const clientState = getBootstrapState(state);
    if (!clientState) {
      throw new Error('Invalid configuration');
    }

    // find the requested asset
    const assetToSend = getAsset(clientState.assets, {
      token,
      address: token.walletAddress,
    });
    if (!assetToSend) {
      throw new Error('Asset not found');
    }

    // save the asset entry to be sent
    setAccountAsset(assetToSend);

    // depending on the type of token, estimate the required gas
    if (
      assetToSend.blockchainAsset.blockchain.networkId &&
      token.type === TokenType.Erc20 &&
      token.address
    ) {
      // retrieve gas for a transaction
      const transferTx = await createErc20TransferTx({
        accessToken,
        chainId: assetToSend.blockchainAsset.blockchain.networkId,
        tokenAddress: token.address,
        fromAddress: token.walletAddress,
        toAddress: token.walletAddress,
        amount: 0.000001,
      });
      const transferTxGas = await getTransactionGasEstimate(
        assetToSend,
        accessToken,
        transferTx,
      );
      setGasFeeEstimate(transferTxGas.networkFee?.amount || '0');
    } else if (token.type === TokenType.Spl && token.address) {
      // TODO - potentially update this gas estimation
      const transferGas = await getTransferGasEstimate(
        assetToSend,
        accessToken,
        // Doesn't matter what the recipient and amount are, just need to get the fee estimate
        assetToSend.address,
        // Use a small test amount to measure gas
        '0.0001',
      );
      setGasFeeEstimate(transferGas.networkFee?.amount || '0');
    } else {
      // retrieve gas for a transfer
      const transferGas = await getTransferGasEstimate(
        assetToSend,
        accessToken,
        // Doesn't matter what the recipient and amount are, just need to get the fee estimate
        assetToSend.address,
        // Use a small test amount to measure gas
        '0.0001',
      );
      setGasFeeEstimate(transferGas.networkFee?.amount || '0');
    }
  };

  const handleSubmitTransaction = () => {
    setTransactionSubmitted(true);
  };

  const handleSendConfirmationClick = () => {
    setSendConfirmation(true);
    setAmount(amount.startsWith('.') ? `0${amount}` : amount);
  };

  const handleRecipientChange = (value: string) => {
    setRecipientAddress(value);
  };

  const handleResolvedDomainChange = (value: string) => {
    setResolvedDomain(value);
    if (value && amountInputRef.current) {
      amountInputRef.current.focus();
    }
  };

  const handleSendInvitation = async (
    emailAddress: string,
  ): Promise<Record<string, string> | undefined> => {
    if (!accountAsset) {
      return undefined;
    }

    // wait for wallet to begin resolving if wallet creation enabled
    while (isSendToEmailEnabled) {
      // prepare the recipient wallet
      const recipientResult = await prepareRecipientWallet(
        accountAsset?.address,
        emailAddress,
        accessToken,
      );

      // return the records if available
      if (recipientResult?.records) {
        return recipientResult.records;
      }

      // wait 10 seconds and try again
      await sleep(10000);
    }
    return undefined;
  };

  const handleAmountChange = (value: string) => {
    // validate an asset is selected
    if (!accountAsset) {
      return;
    }

    // normalize asset decimals if present
    const normalizedBase = parseInt(value, 10);
    const normalizedValue =
      value.includes('.') && accountAsset.balance?.decimals
        ? `${normalizedBase}.${value
            .replaceAll(`${normalizedBase}.`, '')
            .slice(0, accountAsset.balance.decimals)}`
        : value;

    // use normalized value
    setAmount(normalizedValue);
  };

  if (selectedToken && !accountAsset) {
    return (
      <Box className={classes.loaderContainer}>
        <OperationStatus
          label={t('wallet.retrievingGasPrice', {
            blockchain: selectedToken?.walletName || '',
          })}
          icon={<MonitorHeartOutlinedIcon />}
        />
      </Box>
    );
  }

  if (!selectedToken || !accountAsset) {
    return (
      <Box className={classes.flexColCenterAligned}>
        <SelectAsset
          onSelectAsset={handleSelectToken}
          wallets={wallets}
          onCancelClick={handleBackClick}
          onClickBuy={onClickBuy}
          onClickReceive={onClickReceive}
          label={t('wallet.selectAssetToSend')}
          requireBalance={true}
          supportedAssetList={config.WALLETS.CHAINS.SEND}
          supportErc20={true}
          supportSpl={isSplTokenEnabled}
        />
      </Box>
    );
  }

  if (!transactionSubmitted && sendConfirmation) {
    return (
      <Box className={classes.flexColCenterAligned}>
        <SendConfirm
          gasFee={gasFeeEstimate}
          asset={accountAsset}
          token={selectedToken}
          onBackClick={handleBackClick}
          onSendClick={handleSubmitTransaction}
          recipientAddress={recipientAddress}
          resolvedDomain={resolvedDomain}
          amount={amount}
          blockchainName={selectedToken.walletName}
          symbol={selectedToken.ticker}
          amountInDollars={
            '$' +
            (parseFloat(amount) * selectedToken.tokenConversionUsd).toFixed(2)
          }
        />
      </Box>
    );
  }
  if (transactionSubmitted) {
    return (
      <Box className={classes.flexColCenterAligned}>
        <TitleWithBackButton
          label={t('wallet.actionOnBlockchainTitle', {
            action: t('common.send'),
            symbol: getBlockchainDisplaySymbol(selectedToken.ticker),
            blockchain: selectedToken.walletName,
          })}
          onCancelClick={onCancelClick}
        />
        <SubmitTransaction
          onCloseClick={onCancelClick}
          onInvitation={handleSendInvitation}
          accessToken={accessToken}
          asset={accountAsset}
          token={selectedToken}
          recipientAddress={recipientAddress}
          recipientDomain={resolvedDomain}
          amount={amount}
          getClient={getClient}
        />
      </Box>
    );
  }

  // determine how much balance for gas token
  const gasTokenBalance =
    wallets.find(
      w =>
        w.address.toLowerCase() === selectedToken.walletAddress.toLowerCase() &&
        w.symbol.toLowerCase() === selectedToken.symbol.toLowerCase(),
    )?.balanceAmt || 0;

  // determine insufficient gas or token balance
  const insufficientBalance =
    parseFloat(amount) > selectedToken.balance ||
    parseFloat(gasFeeEstimate || '0') > gasTokenBalance;

  const canSend = Boolean(
    !insufficientBalance &&
      gasFeeEstimate &&
      recipientAddress &&
      !transactionSubmitted &&
      gasTokenBalance !== 0 &&
      parseFloat(amount) !== 0 &&
      !isNaN(parseFloat(amount)),
  );

  return (
    <Box className={classes.flexColCenterAligned}>
      <TitleWithBackButton
        onCancelClick={handleBackClick}
        label={t('wallet.actionOnBlockchainTitle', {
          action: t('common.send'),
          symbol: getBlockchainDisplaySymbol(selectedToken.ticker),
          blockchain: selectedToken.walletName,
        })}
      />
      <Box className={classes.contentWrapper}>
        <Box className={classes.selectAssetContainer}>
          <Box className={classes.sendAssetContainer}>
            <img src={selectedToken.imageUrl} className={classes.assetLogo} />
          </Box>
          <Box className={classes.recipientWrapper}>
            <AddressInput
              label={t('wallet.recipient')}
              placeholder={t(
                isSendToEmailEnabled
                  ? 'wallet.recipientDomainEmailOrWallet'
                  : 'wallet.recipientDomainOrAddress',
              )}
              initialAddressValue={recipientAddress}
              initialResolvedDomainValue={resolvedDomain}
              onAddressChange={handleRecipientChange}
              onResolvedDomainChange={handleResolvedDomainChange}
              onInvitation={handleSendInvitation}
              createWalletEnabled={isSendToEmailEnabled}
              asset={selectedToken}
            />
          </Box>
          <AmountInput
            gasFeeEstimate={
              selectedToken.symbol === selectedToken.ticker
                ? gasFeeEstimate
                : '0'
            }
            amountInputRef={amountInputRef}
            token={selectedToken}
            initialAmount={amount}
            onTokenAmountChange={handleAmountChange}
          />
          <Box className={cx(classes.fullWidth, classes.footer)}>
            <Box />
            <Box display="flex" mt={3}>
              <Button
                fullWidth
                onClick={handleSendConfirmationClick}
                disabled={!canSend}
                variant="contained"
                data-testid="send-button"
              >
                {t('common.send')}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Send;
