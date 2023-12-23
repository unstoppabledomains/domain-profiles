import VerifiedIcon from '@mui/icons-material/Verified';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useTranslationContext} from '../../lib';
import type {SerializedWalletBalance} from '../../lib/types/domain';
import {DomainWallet} from './DomainWallet';

const useStyles = makeStyles()((theme: Theme) => ({
  walletContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: theme.spacing(1),
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.h5.fontSize,
    margin: theme.spacing(6, 0, 1),
    lineHeight: 1.4,
  },
  verifiedIcon: {
    color: theme.palette.neutralShades[200],
    marginLeft: theme.spacing(1),
    width: '20px',
    height: '20px',
  },
}));

export const DomainWalletList: React.FC<DomainWalletListProps> = ({
  domain,
  wallets,
  minCount = 2,
  maxCount = 4,
}) => {
  const theme = useTheme();
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const showCount = Math.min(wallets.length, isMobile ? minCount : maxCount);

  // hide components when there are no wallets
  if (showCount === 0) {
    return null;
  }

  // render the wallet list
  return (
    <Box className={classes.walletContainer}>
      <Box className={classes.sectionHeader}>
        <Typography variant="h6">{t('verifiedWallets.title')}</Typography>
        <Tooltip title={t('verifiedWallets.verifiedOnly', {domain})}>
          <VerifiedIcon className={classes.verifiedIcon} />
        </Tooltip>
      </Box>
      <Grid container spacing={2}>
        {wallets
          .sort(
            (a, b) =>
              parseFloat(
                b.value?.walletUsd?.replaceAll('$', '')?.replaceAll(',', '') ||
                  '0',
              ) -
              parseFloat(
                a.value?.walletUsd?.replaceAll('$', '')?.replaceAll(',', '') ||
                  '0',
              ),
          )
          .slice(0, showCount)
          .map(w => (
            <Grid key={w.address} item xs={12 / showCount}>
              <DomainWallet domain={domain} wallet={w} />
            </Grid>
          ))}
      </Grid>
    </Box>
  );
};

export type DomainWalletListProps = {
  domain: string;
  wallets: SerializedWalletBalance[];
  minCount?: number;
  maxCount?: number;
};
