import VerifiedIcon from '@mui/icons-material/Verified';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
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
    paddingBottom: theme.spacing(1),
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.h5.fontSize,
    margin: theme.spacing(6, 0, 1),
    lineHeight: 1.4,
  },
  verifiedIcon: {
    color: theme.palette.success.main,
    marginLeft: theme.spacing(0.5),
    width: '15px',
    height: '15px',
  },
}));

export const DomainWalletList: React.FC<DomainWalletListProps> = ({
  domain,
  wallets,
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();

  return (
    <Box className={classes.walletContainer}>
      <Box className={classes.sectionHeader}>
        <Typography variant="h6">{t('verifiedWallets.title')}</Typography>
        <Tooltip title={t('verifiedWallets.verifiedOnly', {domain})}>
          <VerifiedIcon className={classes.verifiedIcon} />
        </Tooltip>
      </Box>
      <Grid container spacing={2}>
        {wallets.map(w => (
          <Grid key={w.address} item xs={6} sm={3}>
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
};
