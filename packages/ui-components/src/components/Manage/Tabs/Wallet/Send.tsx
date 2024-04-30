import type {IFireblocksNCW} from '@fireblocks/ncw-js-sdk';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import type {SerializedWalletBalance} from '../../../../lib';
import {useTranslationContext} from '../../../../lib';
import type {TokenEntry} from '../../../Wallet/Token';
import ManageInput from '../../common/ManageInput';
import AddressInput from './AddressInput';
import {SelectAsset} from './SelectAsset';
import TransactionStatus from './SubmitTransaction';
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
  client: IFireblocksNCW;
  accessToken: string;
  wallets: SerializedWalletBalance[];
};

const Send: React.FC<Props> = ({
  onCancelClick,
  onClickBuy,
  onClickReceive,
  client,
  accessToken,
  wallets,
}) => {
  const [t] = useTranslationContext();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [asset, setAsset] = useState<TokenEntry>();
  const [amount, setAmount] = useState('');
  const [transactionSubmitted, setTransactionSubmitted] = useState(false);
  const [resolvedDomain, setResolvedDomain] = useState('');
  const {classes} = useStyles();

  const resetForm = () => {
    setResolvedDomain('');
    setRecipientAddress('');
    setAmount('');
    setAsset(undefined);
  };

  const handleBackClick = () => {
    if (!asset) {
      onCancelClick();
    }
    resetForm();
  };

  const handleSubmitTransaction = async () => {
    setTransactionSubmitted(true);
  };

  const handleRecipientChange = (value: string) => {
    setRecipientAddress(value);
  };

  const handleResolvedDomainChange = (value: string) => {
    setResolvedDomain(value);
  };

  const handleMaxClick = () => {
    handleAmountChange('amount', asset?.balance.toString() || '');
  };

  const handleAmountChange = (id: string, value: string) => {
    const numberValue = Number(value);
    if ((isNaN(numberValue) || numberValue < 0) && value !== '.') {
      return;
    }
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
        <TransactionStatus
          onCloseClick={onCancelClick}
          accessToken={accessToken}
          asset={asset}
          recipientAddress={recipientAddress}
          recipientDomain={resolvedDomain}
          amount={amount}
          client={client}
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
              label={'Recipient'}
              placeholder={'Recipient domain or address'}
              onAddressChange={handleRecipientChange}
              onResolvedDomainChange={handleResolvedDomainChange}
              assetSymbol={asset.ticker}
            />
          </Box>
          <Box className={classes.sendAmountContainer}>
            <div className={classes.amountInputWrapper}>
              <ManageInput
                id="amount"
                value={amount}
                label={'Amount'}
                placeholder={`Amount in ${asset.ticker}`}
                onChange={handleAmountChange}
                stacked={true}
                error={insufficientBalance}
                errorText={insufficientBalance ? 'Insufficient balance' : ''}
                endAdornment={<Button onClick={handleMaxClick}>Max</Button>}
              />
            </div>
            {insufficientBalance ? null : (
              <Typography
                variant="subtitle1"
                className={classes.availableBalance}
              >
                Available: {asset.balance.toFixed(5)} {asset.ticker}
              </Typography>
            )}
          </Box>
          <Box display="flex" mt={3} className={classes.fullWidth}>
            <Button
              fullWidth
              onClick={handleSubmitTransaction}
              disabled={!canSend}
              variant="contained"
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
