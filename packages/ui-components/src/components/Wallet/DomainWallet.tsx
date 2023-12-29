import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
import HistoryIcon from '@mui/icons-material/History';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {useTheme} from '@mui/material/styles';
import type {Theme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, {useState} from 'react';
import type {MouseEvent} from 'react';
import {QRCode} from 'react-qrcode-logo';

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
  balanceUsd: {
    color: theme.palette.neutralShades[100],
    fontWeight: 'bold',
  },
  balanceNative: {
    color: theme.palette.neutralShades[200],
  },
  balanceContainer: {
    position: 'absolute',
    bottom: 25,
    left: 16,
    display: 'flex',
    justifyContent: 'space-between',
    background: `repeating-linear-gradient(
      -45deg,
      ${theme.palette.neutralShades[800]},
      ${theme.palette.neutralShades[800]} 5px,
      ${theme.palette.neutralShades[700]} 5px,
      ${theme.palette.neutralShades[700]} 6px
    )`,
    border: `2px solid ${theme.palette.neutralShades[800]}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0.66),
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(-1),
    marginRight: theme.spacing(-1),
    marginBottom: theme.spacing(-2),
    width: 'calc(100% - 16px)',
  },
  card: {
    position: 'relative',
    backgroundImage: `linear-gradient(${theme.palette.neutralShades[600]}, ${theme.palette.neutralShades[800]})`,
    height: '100%',
  },
  detailsContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(-4),
    marginBottom: theme.spacing(4),
  },
  detailsIcon: {
    color: theme.palette.neutralShades[400],
    width: '14px',
    height: '14px',
    marginRight: theme.spacing(0.5),
  },
  detailsText: {
    color: theme.palette.white,
    whiteSpace: 'nowrap',
    marginRight: theme.spacing(2),
  },
  divider: {
    marginTop: theme.spacing(1),
  },
  headerMenuIcon: {
    color: theme.palette.neutralShades[400],
  },
  statsContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
  },
  subTitle: {
    color: theme.palette.neutralShades[400],
  },
  title: {
    color: theme.palette.white,
    fontWeight: 'bold',
  },
}));

export const DomainWallet: React.FC<DomainWalletProps> = ({domain, wallet}) => {
  const {classes} = useStyles();
  const theme = useTheme();
  const [t] = useTranslationContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [qrCodeOpen, setQrCodeOpen] = useState(false);

  const handleExplorerClick = () => {
    window.open(wallet.blockchainScanUrl, '_blank');
  };

  const handleQrClick = () => {
    setQrCodeOpen(true);
  };

  const handleQrClose = () => {
    setQrCodeOpen(false);
  };

  const handleFindUsersClick = () => {
    // TODO
  };

  const handleOpenMenu = (e: MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // determine the wallet balance
  if (!wallet.balance) {
    return null;
  }
  const nativeAmount = parseFloat(wallet.balance);

  return (
    <Card className={classes.card}>
      <CardHeader
        title={
          <Typography className={classes.title} variant="body2">
            {wallet.name}
          </Typography>
        }
        subheader={
          <Tooltip title={wallet.address}>
            <Box display="flex" alignItems="center">
              <Typography className={classes.subTitle} variant="body2">
                {displayShortCryptoAddress(wallet.address, 5, 5)}
              </Typography>
              <CopyToClipboard stringToCopy={wallet.address}>
                <IconButton>
                  <ContentCopyIcon className={classes.detailsIcon} />
                </IconButton>
              </CopyToClipboard>
            </Box>
          </Tooltip>
        }
        avatar={<CryptoIcon currency={wallet.symbol as CurrenciesType} />}
        action={
          <>
            <IconButton
              onClick={handleOpenMenu}
              className={classes.headerMenuIcon}
            >
              <MoreVertOutlinedIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              onClose={handleCloseMenu}
              open={Boolean(anchorEl)}
              transformOrigin={{horizontal: 'right', vertical: 'top'}}
              anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
            >
              <MenuItem
                onClick={() => {
                  handleCloseMenu();
                  handleQrClick();
                }}
              >
                <ListItemIcon>
                  <QrCode2OutlinedIcon className={classes.actionIcon} />
                </ListItemIcon>
                <Typography variant="body2">
                  {t('verifiedWallets.qrCodeTitle')}
                </Typography>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleCloseMenu();
                  handleExplorerClick();
                }}
              >
                <ListItemIcon>
                  <QueryStatsIcon className={classes.actionIcon} />
                </ListItemIcon>
                <Typography variant="body2">
                  {t('verifiedWallets.viewExplorer')}
                </Typography>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleCloseMenu();
                  handleFindUsersClick();
                }}
              >
                <ListItemIcon>
                  <GroupAddOutlinedIcon className={classes.actionIcon} />
                </ListItemIcon>
                <Typography variant="body2">
                  {`${t('verifiedWallets.othersWithWallet', {
                    chain: wallet.name,
                  })} (${t('common.comingSoon').toLowerCase()})`}
                </Typography>
              </MenuItem>
            </Menu>
          </>
        }
      />
      <CardContent>
        <Box className={classes.walletContainer}>
          <Box className={classes.detailsContainer}>
            <Divider className={classes.divider} />
            {wallet.stats?.transactions && (
              <Box className={classes.statsContainer}>
                <ReceiptLongOutlinedIcon className={classes.detailsIcon} />
                <Typography className={classes.detailsText} variant="caption">
                  {wallet.stats.transactions}{' '}
                  {t('verifiedWallets.transactions')}
                </Typography>
              </Box>
            )}
            {wallet.firstTx ? (
              <Box className={classes.statsContainer}>
                <HistoryIcon className={classes.detailsIcon} />
                <Tooltip
                  title={t('verifiedWallets.firstTxDate', {
                    date: new Date(wallet.firstTx).toLocaleDateString(),
                  })}
                >
                  <Typography className={classes.detailsText} variant="caption">
                    {t('verifiedWallets.first')}{' '}
                    {new Date(wallet.firstTx).getFullYear()}
                  </Typography>
                </Tooltip>
              </Box>
            ) : (
              wallet.lastTx && (
                <Box className={classes.statsContainer}>
                  <HistoryIcon className={classes.detailsIcon} />
                  <Tooltip
                    title={t('verifiedWallets.lastTxDate', {
                      date: new Date(wallet.lastTx).toLocaleDateString(),
                    })}
                  >
                    <Typography
                      className={classes.detailsText}
                      variant="caption"
                    >
                      {t('verifiedWallets.last')}{' '}
                      {new Date(wallet.lastTx).getFullYear()}
                    </Typography>
                  </Tooltip>
                </Box>
              )
            )}
            {wallet.stats?.nfts && (
              <Box className={classes.statsContainer}>
                <CollectionsOutlinedIcon className={classes.detailsIcon} />
                <Typography className={classes.detailsText} variant="caption">
                  {wallet.stats.nfts} {t('verifiedWallets.nfts')}
                </Typography>
              </Box>
            )}
            <Box className={classes.balanceContainer}>
              <Box display="flex" alignItems="center">
                <MonetizationOnIcon className={classes.detailsIcon} />
                <Typography className={classes.balanceUsd} variant="caption">
                  {wallet.value?.walletUsd}
                </Typography>
              </Box>
              <Typography className={classes.balanceNative} variant="caption">
                {nativeAmount.toFixed(5).replace(/\.0+$/, '') || 0}{' '}
                {wallet.symbol}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
      <Dialog open={qrCodeOpen} onClose={handleQrClose}>
        <DialogTitle>
          <Box display="flex" flexDirection="column">
            <Typography variant="h6">
              {t('verifiedWallets.scanWithWallet', {chain: wallet.name})}
            </Typography>
            <Typography variant="caption">{wallet.address}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="center">
            <QRCode
              value={`${wallet.name.toLowerCase()}:${wallet.address}`}
              size={isMobile ? 300 : 400}
              logoOpacity={0.5}
              logoHeight={60}
              logoWidth={60}
              qrStyle={'dots'}
              ecLevel={'H'}
              eyeRadius={5}
              style={{innerHeight: 80, innerWidth: 30}}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export type DomainWalletProps = {
  domain: string;
  wallet: SerializedWalletBalance;
};
