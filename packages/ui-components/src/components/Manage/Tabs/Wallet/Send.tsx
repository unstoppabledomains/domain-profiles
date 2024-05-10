import type {IFireblocksNCW} from '@fireblocks/ncw-js-sdk';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import type {Theme} from '@mui/material/styles';
import React, {useRef, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import type {SerializedWalletBalance} from '../../../../lib';
import {useTranslationContext} from '../../../../lib';
import type {TokenEntry} from '../../../Wallet/Token';
import AddressInput from './AddressInput';
import AmountInput from './AmountInput';
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
  },
  selectAssetContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '250px',
    justifyContent: 'space-between',
    width: '100%',
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
  const [asset, setAsset] = useState<TokenEntry>();
  const [amount, setAmount] = useState('');
  const [transactionSubmitted, setTransactionSubmitted] = useState(false);
  const [sendConfirmation, setSendConfirmation] = useState(false);
  const [resolvedDomain, setResolvedDomain] = useState('');
  const {classes} = useStyles();
  const amountInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setResolvedDomain('');
    setRecipientAddress('');
    setAmount('');
    setSendConfirmation(false);
    setAsset(undefined);
  };

  const handleBackClick = () => {
    if (!asset) {
      onCancelClick();
    }
    if (!transactionSubmitted && sendConfirmation) {
      setSendConfirmation(false);
      return;
    }
    resetForm();
  };

  const handleSubmitTransaction = () => {
    setTransactionSubmitted(true);
  };

  const handleSendConfirmationClick = () => {
    setSendConfirmation(true);
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

  if (!asset) {
    return (
      <Box className={classes.flexColCenterAligned}>
        <SelectAsset
          onSelectAsset={setAsset}
          wallets={wallets}
          onCancelClick={handleBackClick}
          onClickBuy={onClickBuy}
          onClickReceive={onClickReceive}
          label={t('wallet.selectAssetToSend')}
          requireBalance={true}
        />
      </Box>
    );
  }

  if (!transactionSubmitted && sendConfirmation) {
    return (
      <SendConfirm
        onBackClick={handleBackClick}
        onSendClick={handleSubmitTransaction}
        recipientAddress={recipientAddress}
        resolvedDomain={resolvedDomain}
        amount={amount}
        blockchainName={asset.name}
        symbol={asset.ticker}
        amountInDollars={
          '$' + (parseFloat(amount) * asset.tokenConversionUsd).toFixed(2)
        }
      />
    );
  }
  if (transactionSubmitted) {
    return (
      <Box className={classes.flexColCenterAligned}>
        <TitleWithBackButton
          label={t('wallet.actionOnBlockchainTitle', {
            action: t('common.send'),
            symbol: asset.ticker,
            blockchain: asset.name,
          })}
          onCancelClick={onCancelClick}
        />
        <SubmitTransaction
          onCloseClick={onCancelClick}
          accessToken={accessToken}
          asset={asset}
          recipientAddress={recipientAddress}
          recipientDomain={resolvedDomain}
          amount={amount}
          getClient={getClient}
        />
      </Box>
    );
  }

  const insufficientBalance = parseFloat(amount) > asset.balance;

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
          symbol: asset.ticker,
          blockchain: asset.name,
        })}
      />
      <Box className={classes.contentWrapper}>
        <Box className={classes.selectAssetContainer}>
          <Box className={classes.sendAssetContainer}>
            <img src={asset.imageUrl} className={classes.assetLogo} />
          </Box>
          <Box className={classes.recipientWrapper}>
            <AddressInput
              label={t('wallet.recipient')}
              placeholder={t('wallet.recipientDomainOrAddress')}
              initialAddressValue={recipientAddress}
              initialResolvedDomainValue={resolvedDomain}
              onAddressChange={handleRecipientChange}
              onResolvedDomainChange={handleResolvedDomainChange}
              assetSymbol={asset.ticker}
            />
          </Box>
          <AmountInput
            amountInputRef={amountInputRef}
            asset={asset}
            initialAmount={amount}
            onTokenAmountChange={handleAmountChange}
          />
          <Box display="flex" mt={3} className={classes.fullWidth}>
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
          <Box display="flex" mt={1} className={classes.fullWidth}>
            <Button fullWidth onClick={onCancelClick} variant="outlined">
              {t('common.cancel')}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Send;
