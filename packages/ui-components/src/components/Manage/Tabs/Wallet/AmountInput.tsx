import SwapVertIcon from '@mui/icons-material/SwapVert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useTranslationContext} from '../../../../lib';
import type {TokenEntry} from '../../../Wallet/Token';
import ManageInput from '../../common/ManageInput';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '113px',
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
  swapCurrencyButton: {
    cursor: 'pointer',
    '&:hover': {
      color: theme.palette.primary.main,
    },
  },
  swapIcon: {
    fontSize: '16px',
  },
}));

type Props = {
  initialAmount: string;
  amountInputRef: React.RefObject<HTMLInputElement>;
  asset: TokenEntry;
  onAmountChange: (tokenAmount: string) => void;
};

const AmountInput: React.FC<Props> = ({
  amountInputRef,
  initialAmount,
  asset,
  onAmountChange,
}) => {
  const [tokenAmount, setTokenAmount] = useState(initialAmount);
  const [fiatAmount, setFiatAmount] = useState('0');
  const [showFiat, setShowFiat] = useState(false);
  const {classes} = useStyles();
  const [t] = useTranslationContext();

  const convertToFiat = (value: string) => {
    if (!value || value === '.') {
      return '0.00';
    }
    return (parseFloat(value || '0') * asset.tokenConversionUsd).toString();
  };

  const convertToToken = (value: string) => {
    if (!value || value === '.') {
      return '0';
    }
    return (parseFloat(value || '0') / asset.tokenConversionUsd).toString();
  };

  const handleAmountChange = (id: string, value: string) => {
    const numberValue = Number(value);
    if ((isNaN(numberValue) || numberValue < 0) && value !== '.') {
      onAmountChange('');
      return;
    }
    setTokenAmount(showFiat ? convertToToken(value) : value);

    setFiatAmount(showFiat ? value : convertToFiat(value));
    onAmountChange(showFiat ? convertToToken(value) : value);
  };

  const toggleShowFiat = () => {
    setShowFiat(!showFiat);
    setFiatAmount(parseFloat(fiatAmount).toFixed(2));
    setTokenAmount(!tokenAmount ? '0' : tokenAmount);
  };

  const handleMaxClick = () => {
    setFiatAmount((asset.balance * asset.tokenConversionUsd).toFixed(2));
    setTokenAmount(asset.balance.toString());
    onAmountChange(asset.balance.toString());
  };

  const insufficientBalance = parseFloat(tokenAmount) > asset.balance;

  return (
    <Box className={classes.container}>
      <div className={classes.amountInputWrapper}>
        <ManageInput
          mt={2}
          id="amount"
          inputRef={amountInputRef}
          value={showFiat ? fiatAmount : tokenAmount}
          label={t('wallet.amount')}
          placeholder={t('wallet.amountInSymbol', {
            symbol: showFiat ? 'USD' : asset.ticker,
          })}
          onChange={handleAmountChange}
          stacked={true}
          error={insufficientBalance}
          errorText={insufficientBalance ? t('wallet.insufficientBalance') : ''}
          endAdornment={<Button onClick={handleMaxClick} data-testid='max-amount-button'>Max</Button>}
        />
      </div>
      {!insufficientBalance && (
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            variant="caption"
            onClick={toggleShowFiat}
            display="flex"
            alignItems="center"
            className={classes.swapCurrencyButton}
            data-testid="swap-currency-button"
          >
            {!showFiat
              ? `~$${parseFloat(fiatAmount).toFixed(2)}`
              : `${parseFloat(tokenAmount).toFixed(5)} ${asset.ticker}`}
            <SwapVertIcon className={classes.swapIcon} />
          </Typography>
          <Typography variant="subtitle1" className={classes.availableBalance}>
            {showFiat
              ? t('wallet.availableUsd', {
                  amount: (asset.balance * asset.tokenConversionUsd).toFixed(2),
                })
              : t('wallet.availableAmount', {
                  amount: asset.balance.toFixed(5),
                  symbol: asset.ticker,
                })}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AmountInput;
