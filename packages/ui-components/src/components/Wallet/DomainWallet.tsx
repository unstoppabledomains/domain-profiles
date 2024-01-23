import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
import HistoryIcon from '@mui/icons-material/History';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import TollOutlinedIcon from '@mui/icons-material/TollOutlined';
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

const bgNeutralShade = 800;
const currencyDecimals = 3;

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
    whiteSpace: 'nowrap',
  },
  balanceNative: {
    color: theme.palette.neutralShades[200],
    whiteSpace: 'nowrap',
  },
  balanceContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    display: 'flex',
    justifyContent: 'space-between',
    background: `repeating-linear-gradient(
      -45deg,
      ${theme.palette.neutralShades[bgNeutralShade]},
      ${theme.palette.neutralShades[bgNeutralShade]} 5px,
      ${theme.palette.neutralShades[bgNeutralShade - 100]} 5px,
      ${theme.palette.neutralShades[bgNeutralShade - 100]} 6px
    )`,
    border: `2px solid ${theme.palette.neutralShades[bgNeutralShade]}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0.66),
    margin: theme.spacing(1),
    width: 'calc(100% - 32px)',
    overflow: 'hidden',
  },
  cardContainer: {
    position: 'relative',
    backgroundImage: `linear-gradient(${
      theme.palette.neutralShades[bgNeutralShade - 200]
    }, ${theme.palette.neutralShades[bgNeutralShade]})`,
    height: '100%',
    minHeight: '235px',
  },
  detailsContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(-4),
    marginBottom: theme.spacing(3),
  },
  detailsIcon: {
    color: theme.palette.neutralShades[bgNeutralShade - 400],
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
    color: theme.palette.neutralShades[bgNeutralShade - 400],
  },
  menuContainer: {
    position: 'absolute',
    margin: theme.spacing(0.5),
    top: 0,
    right: 0,
  },
  statsContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
    width: 'calc(100%  - 1px)',
    justifyContent: 'space-between',
  },
  subTitle: {
    color: theme.palette.neutralShades[bgNeutralShade - 400],
    whiteSpace: 'nowrap',
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

  // native amount display value
  const nativeAmount = parseFloat(wallet.balance);
  const nativeAmountDisplay =
    nativeAmount.toFixed(currencyDecimals).replace(/\.0+$/, '') || '0';

  return (
    <Card className={classes.cardContainer}>
      <CardHeader
        title={
          <Typography className={classes.title} variant="body2">
            {wallet.name}
          </Typography>
        }
        subheader={
          <Tooltip title={wallet.address}>
            <Box display="flex" alignItems="center">
              <Typography className={classes.subTitle} variant="caption">
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
          <Box className={classes.menuContainer}>
            <IconButton
              onClick={handleOpenMenu}
              className={classes.headerMenuIcon}
            >
              <MoreVertOutlinedIcon fontSize="small" />
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
                disabled={true}
                sx={{display: 'none'}}
              >
                <ListItemIcon>
                  <GroupAddOutlinedIcon className={classes.actionIcon} />
                </ListItemIcon>
                <Typography variant="body2">
                  {t('verifiedWallets.othersWithWallet', {
                    chain: wallet.name,
                  })}
                </Typography>
              </MenuItem>
            </Menu>
          </Box>
        }
      />
      <CardContent>
        <Box className={classes.walletContainer}>
          <Box className={classes.detailsContainer}>
            <Divider className={classes.divider} />
            {wallet.stats?.transactions && (
              <Box className={classes.statsContainer}>
                <Box display="flex" alignItems="center">
                  <ReceiptLongOutlinedIcon className={classes.detailsIcon} />
                  <Typography className={classes.detailsText} variant="caption">
                    {wallet.stats.transactions}{' '}
                    {parseInt(wallet.stats.transactions, 10) === 1
                      ? t('verifiedWallets.transaction')
                      : t('verifiedWallets.transactions')}
                  </Typography>
                </Box>
              </Box>
            )}
            {wallet.firstTx ? (
              <Box className={classes.statsContainer}>
                <Box display="flex" alignItems="center">
                  <HistoryIcon className={classes.detailsIcon} />
                  <Tooltip
                    title={t('verifiedWallets.firstTxDate', {
                      date: new Date(wallet.firstTx).toLocaleDateString(),
                    })}
                  >
                    <Typography
                      className={classes.detailsText}
                      variant="caption"
                    >
                      {t('verifiedWallets.first')}{' '}
                      {new Date(wallet.firstTx).getFullYear()}
                    </Typography>
                  </Tooltip>
                </Box>
              </Box>
            ) : (
              wallet.lastTx && (
                <Box className={classes.statsContainer}>
                  <Box display="flex" alignItems="center">
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
                </Box>
              )
            )}
            {wallet.stats?.nfts && (
              <Tooltip
                title={
                  <Box display="flex" flexDirection="column">
                    {wallet.nfts
                      ?.filter(nftCollection => nftCollection.totalValueUsdAmt)
                      .sort(
                        (a, b) =>
                          (b.totalValueUsdAmt || 0) - (a.totalValueUsdAmt || 0),
                      )
                      .map(nftCollection => (
                        <Typography variant="caption" key={nftCollection.name}>
                          - {nftCollection.name} (
                          {nftCollection.totalValueUsd || '$0.00'})
                        </Typography>
                      ))
                      .slice(0, 10)}
                  </Box>
                }
              >
                <Box className={classes.statsContainer}>
                  <Box display="flex" alignItems="center">
                    <CollectionsOutlinedIcon className={classes.detailsIcon} />
                    <Typography
                      className={classes.detailsText}
                      variant="caption"
                    >
                      {wallet.stats.nfts}{' '}
                      {parseInt(wallet.stats.nfts, 10) === 1
                        ? t('verifiedWallets.nft')
                        : t('verifiedWallets.nfts')}
                    </Typography>
                  </Box>
                  <Box mr={1}></Box>
                  {wallet.nfts && (
                    <Box display="flex" alignItems="center">
                      <MonetizationOnIcon className={classes.detailsIcon} />
                      <Typography
                        className={classes.balanceUsd}
                        variant="caption"
                      >
                        {wallet.nfts
                          ?.map(
                            nftCollection =>
                              nftCollection.totalValueUsdAmt || 0,
                          )
                          .reduce((p, c) => p + c, 0)
                          .toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          })}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Tooltip>
            )}
            {wallet.tokens && wallet.tokens.length > 0 && (
              <Tooltip
                title={
                  <Box display="flex" flexDirection="column">
                    {wallet.tokens
                      .filter(walletToken => walletToken.value?.walletUsdAmt)
                      .sort(
                        (a, b) =>
                          (b.value?.walletUsdAmt || 0) -
                          (a.value?.walletUsdAmt || 0),
                      )
                      .map(walletToken => (
                        <Typography variant="caption" key={walletToken.name}>
                          - {walletToken.name} (
                          {walletToken.value?.walletUsd || '$0.00'})
                        </Typography>
                      ))
                      .slice(0, 10)}
                  </Box>
                }
              >
                <Box className={classes.statsContainer}>
                  <Box display="flex" alignItems="center">
                    <TollOutlinedIcon className={classes.detailsIcon} />
                    <Typography
                      className={classes.detailsText}
                      variant="caption"
                    >
                      {wallet.tokens.length}{' '}
                      {wallet.tokens.length === 1
                        ? t('verifiedWallets.token')
                        : t('verifiedWallets.tokens')}
                    </Typography>
                  </Box>
                  <Box mr={1}></Box>
                  <Box display="flex" alignItems="center">
                    <MonetizationOnIcon className={classes.detailsIcon} />
                    <Typography
                      className={classes.balanceUsd}
                      variant="caption"
                    >
                      {wallet.tokens
                        .map(
                          walletToken => walletToken.value?.walletUsdAmt || 0,
                        )
                        .reduce((p, c) => p + c, 0)
                        .toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        })}
                    </Typography>
                  </Box>
                </Box>
              </Tooltip>
            )}
            <Box className={classes.balanceContainer}>
              <Box display="flex" alignItems="center">
                <AccountBalanceWalletIcon className={classes.detailsIcon} />
                <Typography className={classes.balanceNative} variant="caption">
                  {nativeAmount > 0 && nativeAmountDisplay === '0'
                    ? '~ 0'
                    : nativeAmountDisplay}{' '}
                  {wallet.symbol}
                </Typography>
              </Box>
              <Box mr={1}></Box>
              <Box display="flex" alignItems="center">
                <MonetizationOnIcon className={classes.detailsIcon} />
                <Typography className={classes.balanceUsd} variant="caption">
                  {wallet.value?.walletUsd}
                </Typography>
              </Box>
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
