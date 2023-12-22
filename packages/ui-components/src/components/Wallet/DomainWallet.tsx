import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HistoryIcon from '@mui/icons-material/History';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import CopyToClipboard from '../../components/CopyToClipboard';
import type {CurrenciesType} from '../../lib';
import {useTranslationContext} from '../../lib';
import {displayShortCryptoAddress} from '../../lib/displayCryptoAddress';
import type {SerializedWalletBalance} from '../../lib/types/domain';
import {CryptoIcon} from '../Image';

const useStyles = makeStyles()((theme: Theme) => ({
  walletContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  actionIcon: {
    width: '16px',
    height: '16px',
  },
  balance: {
    fontWeight: 'bold',
  },
  card: {
    backgroundImage: `linear-gradient(${theme.palette.neutralShades[50]}, white)`,
  },
  detailsContainer: {
    display: 'flex',
    marginTop: theme.spacing(2),
  },
  detailsIcon: {
    color: theme.palette.neutralShades[600],
    width: '14px',
    height: '14px',
    marginRight: theme.spacing(0.5),
  },
  detailsText: {
    whiteSpace: 'nowrap',
    marginRight: theme.spacing(2),
  },
}));

export const DomainWallet: React.FC<DomainWalletProps> = ({domain, wallet}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();

  const handleExplorerClick = () => {
    window.open(wallet.blockchainScanUrl, '_blank');
  };

  // determine the wallet balance
  if (!wallet.balance) {
    return null;
  }
  const nativeAmount = parseFloat(wallet.balance);

  return (
    <Card className={classes.card}>
      <CardHeader
        title={wallet.name}
        subheader={
          <Tooltip title={wallet.address}>
            <>{displayShortCryptoAddress(wallet.address, 5, 5)}</>
          </Tooltip>
        }
        avatar={<CryptoIcon currency={wallet.symbol as CurrenciesType} />}
      />
      <CardContent>
        <Box className={classes.walletContainer}>
          <Typography className={classes.balance} variant="body2">
            {nativeAmount.toFixed(5).replace(/\.0+$/, '') || 0} {wallet.symbol}
          </Typography>
          <Typography variant="caption">{wallet.value?.walletUsd}</Typography>
          <Box className={classes.detailsContainer}>
            {wallet.firstTx && (
              <Box display="flex" alignItems="center">
                <HistoryIcon className={classes.detailsIcon} />
                <Tooltip
                  title={t('verifiedWallets.firstTxDate', {
                    date: new Date(wallet.firstTx).toLocaleDateString(),
                  })}
                >
                  <Typography className={classes.detailsText} variant="caption">
                    {t('common.since')} {new Date(wallet.firstTx).getFullYear()}
                  </Typography>
                </Tooltip>
              </Box>
            )}
            <Box display="flex" alignItems="center">
              <CollectionsOutlinedIcon className={classes.detailsIcon} />
              <Typography className={classes.detailsText} variant="caption">
                {wallet.stats?.nfts || 0} {t('verifiedWallets.nfts')}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
      <CardActions>
        <CopyToClipboard stringToCopy={wallet.address}>
          <Tooltip title={t('profile.copyAddress')}>
            <IconButton>
              <ContentCopyIcon className={classes.actionIcon} />
            </IconButton>
          </Tooltip>
        </CopyToClipboard>
        <Tooltip title={t('verifiedWallets.viewExplorer')}>
          <IconButton onClick={handleExplorerClick}>
            <QueryStatsIcon className={classes.actionIcon} />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export type DomainWalletProps = {
  domain: string;
  wallet: SerializedWalletBalance;
};
