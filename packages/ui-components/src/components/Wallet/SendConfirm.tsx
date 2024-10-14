import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {round} from 'lodash';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useTranslationContext} from '../../lib';
import type {AccountAsset} from '../../lib/types/fireBlocks';
import {
  getBlockchainDisplaySymbol,
  getBlockchainGasSymbol,
  getBlockchainSymbol,
} from '../Manage/common/verification/types';
import {TitleWithBackButton} from './TitleWithBackButton';

const useStyles = makeStyles()((theme: Theme) => ({
  fullWidth: {
    width: '100%',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    gap: '7px',
    marginBottom: theme.spacing(5),
    backgroundColor: theme.palette.primaryShades[100],
    padding: 12,
    borderRadius: 8,
    height: '100%',
  },
  icon: {
    fontSize: '60px',
  },
  subTitlePending: {
    marginTop: theme.spacing(1),
    color: theme.palette.neutralShades[400],
  },
  subTitleComplete: {
    marginTop: theme.spacing(1),
  },
}));

const MAX_DISPLAY_LENGTH = 12;

type Props = {
  onBackClick: () => void;
  onSendClick: () => void;
  recipientAddress: string;
  resolvedDomain: string;
  amount: string;
  symbol: string;
  asset: AccountAsset;
  gasFee: string;
  amountInDollars: string;
  blockchainName: string;
};

const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const SendConfirm: React.FC<Props> = ({
  onBackClick,
  recipientAddress,
  resolvedDomain,
  asset,
  amount,
  symbol,
  amountInDollars,
  blockchainName,
  onSendClick,
  gasFee,
}) => {
  const [t] = useTranslationContext();
  const {classes} = useStyles();
  const maxDisplayLength = asset.balance?.decimals
    ? Math.min(MAX_DISPLAY_LENGTH, asset.balance.decimals)
    : MAX_DISPLAY_LENGTH;
  const assetSymbol = asset.blockchainAsset.symbol.toUpperCase();
  const gasSymbol = getBlockchainGasSymbol(
    getBlockchainSymbol(asset.blockchainAsset.blockchain.id),
  ).toUpperCase();

  return (
    <Box className={classes.container}>
      <TitleWithBackButton onCancelClick={onBackClick} label={'Summary'} />
      <Box
        mt={2}
        display="flex"
        alignItems="center"
        flexDirection="column"
        width="100%"
        height="100%"
        justifyContent="space-between"
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          width="100%"
        >
          <Typography variant="h4" textAlign="center">
            {amount} {getBlockchainDisplaySymbol(symbol)}
          </Typography>
          <Typography variant="body2">{amountInDollars}</Typography>
          <Box className={classes.contentContainer} mt={3}>
            <Box
              display="flex"
              width="100%"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="h6">{t('common.to')}</Typography>
              <Typography variant="body2">
                {resolvedDomain ? <b>{resolvedDomain} </b> : ''}
                {resolvedDomain !== recipientAddress && (
                  <>({truncateAddress(recipientAddress)})</>
                )}
              </Typography>
            </Box>
            <Box
              display="flex"
              width="100%"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="h6">{t('common.network')}</Typography>
              <Typography variant="body2">{blockchainName}</Typography>
            </Box>
            <Box
              display="flex"
              width="100%"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="h6">{t('wallet.networkFee')}</Typography>
              <Typography variant="body2">
                {!gasFee ? (
                  <CircularProgress size={20} />
                ) : (
                  `${round(
                    parseFloat(gasFee),
                    maxDisplayLength,
                  )} ${getBlockchainDisplaySymbol(
                    getBlockchainSymbol(asset.blockchainAsset.blockchain.id),
                  )}`
                )}
              </Typography>
            </Box>
            <Box display="flex" width="100%" justifyContent="space-between">
              <Typography variant="h6">{t('wallet.totalCost')}</Typography>
              {assetSymbol === gasSymbol ? (
                <Typography variant="body2">
                  {round(Number(amount) + Number(gasFee), maxDisplayLength)}{' '}
                  {getBlockchainDisplaySymbol(assetSymbol)}
                </Typography>
              ) : (
                <Box display="flex" flexDirection="column" textAlign="right">
                  <Typography variant="body2">
                    {round(Number(amount), maxDisplayLength)}{' '}
                    {getBlockchainDisplaySymbol(assetSymbol)}
                  </Typography>
                  <Typography variant="body2">
                    {round(Number(gasFee), maxDisplayLength)}{' '}
                    {getBlockchainDisplaySymbol(gasSymbol)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
        <Button
          onClick={onSendClick}
          variant="contained"
          fullWidth
          data-testid="send-confirm-button"
        >
          {t('common.confirm')}
        </Button>
      </Box>
    </Box>
  );
};

export default SendConfirm;
