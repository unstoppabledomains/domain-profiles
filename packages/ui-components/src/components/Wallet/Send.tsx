import type {IFireblocksNCW} from '@fireblocks/ncw-js-sdk';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import type {Theme} from '@mui/material/styles';
import React, {useRef, useState} from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {
  getAccountAssets,
  getEstimateTransferResponse,
} from '../../actions/fireBlocksActions';
import type {SerializedWalletBalance} from '../../lib';
import {useTranslationContext} from '../../lib';
import type {AccountAsset} from '../../lib/types/fireBlocks';
import AddressInput from './AddressInput';
import AmountInput from './AmountInput';
import {OperationStatus} from './OperationStatus';
import {SelectAsset} from './SelectAsset';
import SendConfirm from './SendConfirm';
import SubmitTransaction from './SubmitTransaction';
import {TitleWithBackButton} from './TitleWithBackButton';
import type {TokenEntry} from './Token';

const useStyles = makeStyles()((theme: Theme) => ({
  flexColCenterAligned: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
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
    height: '60px',
    width: '60px',
    marginTop: '10px',
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
    height: '109px',
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
};

const Send: React.FC<Props> = ({
  onCancelClick,
  onClickBuy,
  onClickReceive,
  getClient,
  accessToken,
  wallets,
}) => {
  const [t] = useTranslationContext();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [accountAsset, setAccountAsset] = useState<AccountAsset>();
  const [selectedToken, setSelectedToken] = useState<TokenEntry>();
  const [amount, setAmount] = useState('');
  const [transactionSubmitted, setTransactionSubmitted] = useState(false);
  const [sendConfirmation, setSendConfirmation] = useState(false);
  const [resolvedDomain, setResolvedDomain] = useState('');
  const [gasFeeEstimate, setGasFeeEstimate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {classes, cx} = useStyles();
  const amountInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setResolvedDomain('');
    setRecipientAddress('');
    setAmount('');
    setSendConfirmation(false);
    setAccountAsset(undefined);
    setSelectedToken(undefined);
  };

  const handleBackClick = () => {
    if (!selectedToken) {
      onCancelClick();
    }
    if (!transactionSubmitted && sendConfirmation) {
      setSendConfirmation(false);
      return;
    }
    resetForm();
  };

  const handleSelectToken = async (token: TokenEntry) => {
    setSelectedToken(token);
    setIsLoading(true);
    const assets = await getAccountAssets(accessToken, true);
    if (!assets) {
      throw new Error('Assets not found');
    }
    const assetToSend = assets.find(
      a =>
        a.blockchainAsset.blockchain.name.toLowerCase() ===
          token.walletName.toLowerCase() &&
        a.blockchainAsset.symbol.toLowerCase() === token.ticker.toLowerCase() &&
        a.address.toLowerCase() === token.walletAddress.toLowerCase(),
    );
    if (!assetToSend) {
      throw new Error('Asset not found');
    }

    // estimate the gas cost
    const gasResponse = await getEstimateTransferResponse(
      assetToSend,
      accessToken,
      // Doesn't matter what the recipient and amount are, just need to get the fee estimate
      assetToSend.address,
      // Use a small test amount to measure gas
      '0.0001',
    );
    setGasFeeEstimate(gasResponse.networkFee.amount);
    setAccountAsset(assetToSend);
    setIsLoading(false);
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

  const handleAmountChange = (value: string) => {
    setAmount(value);
  };

  if (isLoading) {
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
          supportedTokenList={config.WALLETS.CHAINS.SEND}
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
            symbol: selectedToken.ticker,
            blockchain: selectedToken.walletName,
          })}
          onCancelClick={onCancelClick}
        />
        <SubmitTransaction
          onCloseClick={onCancelClick}
          accessToken={accessToken}
          asset={accountAsset}
          recipientAddress={recipientAddress}
          recipientDomain={resolvedDomain}
          amount={amount}
          getClient={getClient}
        />
      </Box>
    );
  }

  const insufficientBalance = parseFloat(amount) > selectedToken.balance;

  const canSend = Boolean(
    !insufficientBalance &&
      recipientAddress &&
      !transactionSubmitted &&
      parseFloat(amount) !== 0 &&
      !isNaN(parseFloat(amount)),
  );

  return (
    <Box className={classes.flexColCenterAligned}>
      <TitleWithBackButton
        onCancelClick={handleBackClick}
        label={t('wallet.actionOnBlockchainTitle', {
          action: t('common.send'),
          symbol: selectedToken.ticker,
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
              placeholder={t('wallet.recipientDomainOrAddress')}
              initialAddressValue={recipientAddress}
              initialResolvedDomainValue={resolvedDomain}
              onAddressChange={handleRecipientChange}
              onResolvedDomainChange={handleResolvedDomainChange}
              assetSymbol={selectedToken.ticker}
            />
          </Box>
          <AmountInput
            gasFeeEstimate={gasFeeEstimate}
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
