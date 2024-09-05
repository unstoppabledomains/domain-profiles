import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import InfoIcon from '@mui/icons-material/Info';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import config from '@unstoppabledomains/config';
import CopyContentIcon from '@unstoppabledomains/ui-kit/icons/CopyContent';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import CopyToClipboard from '../../components/CopyToClipboard';
import {CryptoIcon} from '../../components/Image/CryptoIcon';
import {useDomainConfig} from '../../hooks';
import {displayShortCryptoAddress} from '../../lib/displayCryptoAddress';
import useTranslationContext from '../../lib/i18n';
import type {CurrenciesType} from '../../lib/types/blockchain';
import type {SerializedPublicDomainProfileData} from '../../lib/types/domain';
import type {MulticoinVersions} from '../../lib/types/records';
import {isEthAddress} from '../Chat/protocol/resolution';
import {DomainProfileTabType} from '../Manage';

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    marginRight: theme.spacing(1),
    [theme.breakpoints.up('md')]: {
      marginBottom: theme.spacing(1),
    },
  },
  row: {
    borderRadius: (theme.shape.borderRadius as number) * 25,
    padding: theme.spacing(0.75, 1),
    backgroundColor: theme.palette.neutralShades[100],
    border: `1px solid ${theme.palette.neutralShades[100]}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    minWidth: '150px',
    transition: theme.transitions.create([
      'background-color',
      'box-shadow',
      'border-color',
    ]),
    '&:hover': {
      backgroundColor: theme.palette.white,
      boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.08)',
      borderColor: theme.palette.neutralShades[200],
    },
  },
  currencyIcon: {
    width: 20,
    height: 20,
    marginRight: theme.spacing(1),
  },
  contentCopyIconButton: {
    marginRight: theme.spacing(1),
    padding: theme.spacing(0.75),
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(1),
    },
  },
  sendButton: {
    ...theme.typography.body1,
    fontWeight: theme.typography.fontWeightBold,
  },
  chain: {
    textAlign: 'center',
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    padding: theme.spacing(0, 0.75),
    border: '1px solid',
    borderColor: theme.palette.greyShades[100],
    borderRadius: theme.shape.borderRadius,
    userSelect: 'none',
  },
  address: {
    marginRight: theme.spacing(1),
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
    userSelect: 'none',
  },
  infoIcon: {
    color: '#D18411',
  },
  tooltipContainer: {
    textAlign: 'center',
  },
  verifyLink: {
    color: '#72E6FC',
    fontSize: '13px',
    padding: 0,
  },
  actionIcon: {
    width: 16,
    height: 16,
    display: 'flex',
    alignItems: 'center',
    fill: theme.palette.neutralShades[600],
  },
  menuList: {
    padding: theme.spacing(1),
  },
  menuItem: {
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1.25, 1),
    fontWeight: theme.typography.fontWeightMedium,
    transition: theme.transitions.create('background-color'),
  },
  menuActionIcon: {
    marginRight: theme.spacing(1),
    height: '14px',
    width: '14px',
  },
}));

export type Props = {
  chain?: string;
  versions?: MulticoinVersions;
  singleAddress?: string;
  showWarning?: boolean;
  profileData?: SerializedPublicDomainProfileData | null;
  ownerAddress?: string;
  domain?: string;
  isOwner?: boolean;
  currency: CurrenciesType;
  onCryptoAddressCopied: () => void;
};

const CryptoAddress: React.FC<Props> = ({
  currency,
  versions,
  singleAddress,
  ownerAddress,
  isOwner,
  showWarning = false,
  profileData,
  chain,
  onCryptoAddressCopied: handleCryptoAddressCopied,
}) => {
  const [t] = useTranslationContext();
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const {classes} = useStyles();
  const {setIsOpen: setConfigOpen, setConfigTab} = useDomainConfig();

  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false);
  const filteredVersions = versions
    ? Object.fromEntries(
        Object.entries(versions).filter(([key, value]) => !!value),
      )
    : undefined;
  const address =
    (filteredVersions ? Object.values(filteredVersions)[0] : singleAddress) ||
    '';
  const versionName =
    filteredVersions &&
    (Object.keys(filteredVersions).length > 1
      ? ` ${t('common.multichain')}`
      : ` ${Object.keys(filteredVersions)[0]}`);
  const [isVerified, setIsVerified] = useState(false);

  // load existing verifications from profile data
  useEffect(() => {
    // wait for prerequisites to be met
    if (!currency || !address || !profileData) {
      return;
    }

    if (address?.toLowerCase() === ownerAddress?.toLowerCase()) {
      setIsVerified(true);
      return;
    }
    // determine if address has already been verified
    (profileData?.cryptoVerifications || []).forEach(verification => {
      if (
        verification.symbol.toLowerCase() === currency.toLowerCase() &&
        verification.address.toLowerCase() === address.toLowerCase()
      ) {
        // set the verified address state
        setIsVerified(true);
      }
    });
  }, [currency, address, profileData, showWarning]);

  const handleMultiAddressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSingleAddressClick = (addr: string) => {
    window.open(getBlockScanUrl(currency, addr), '_blank');
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTooltipClose = () => {
    setTooltipOpen(false);
  };

  const handleTooltipOpen = () => {
    setTooltipOpen(true);
  };

  const handleVerifyClick = () => {
    setConfigTab(DomainProfileTabType.Crypto);
    setConfigOpen(true);
  };

  const getBlockScanUrl = (symbol: CurrenciesType, addr: string) => {
    switch (symbol) {
      case 'ETH':
      case 'FTM':
      case 'AVAX':
      case 'BASE':
        return isEthAddress(addr)
          ? `https://www.oklink.com/${symbol.toLowerCase()}/address/${addr}?channelId=uns001`
          : '';
      case 'MATIC':
        return isEthAddress(addr)
          ? `https://www.oklink.com/polygon/address/${addr}?channelId=uns001`
          : '';
      case 'BTC':
        return `https://www.oklink.com/${symbol.toLowerCase()}/address/${addr}?channelId=uns001`;
      case 'SOL':
        return `https://www.oklink.com/sol/account/${addr}?channelId=uns001`;
      default:
        return '';
    }
  };

  const showTooltip = showWarning && !isVerified && isSupported(currency);
  const isSingleAddress = Object.keys(filteredVersions || []).length <= 1;
  const isSingleAddressWithLink =
    isSingleAddress && getBlockScanUrl(currency, address);

  const item = (
    <div
      key={currency}
      className={classes.row}
      onClick={
        isSingleAddressWithLink
          ? () => handleSingleAddressClick(address)
          : isSingleAddress
          ? undefined
          : handleMultiAddressClick
      }
    >
      <Tooltip
        title={`${currency}${filteredVersions ? versionName : ''}`}
        placement="bottom"
        arrow
      >
        <CryptoIcon currency={currency} className={classes.currencyIcon} />
      </Tooltip>
      {chain && <span className={classes.chain}>{chain}</span>}
      <Typography className={classes.address}>
        {displayShortCryptoAddress(address, 4, 4)}
      </Typography>
      {showTooltip ? (
        <ClickAwayListener onClickAway={handleTooltipClose}>
          <Tooltip
            arrow
            open={tooltipOpen}
            onClose={handleTooltipClose}
            onOpen={handleTooltipOpen}
            disableFocusListener
            disableTouchListener
            title={
              <div className={classes.tooltipContainer}>
                <Typography variant="caption" color="inherit">
                  {isOwner
                    ? t('manage.addressNotVerified')
                    : t('manage.addressNotVerifiedNonOwner')}
                  <br />
                  {isOwner ? (
                    <Button
                      className={classes.verifyLink}
                      variant="text"
                      onClick={handleVerifyClick}
                    >
                      {t('profile.verifyWalletAddress')}
                    </Button>
                  ) : (
                    <Button className={classes.verifyLink} variant="text">
                      {t('profile.copyTheAddress')}
                    </Button>
                  )}
                </Typography>
              </div>
            }
          >
            <InfoIcon
              fontSize="small"
              className={classes.infoIcon}
              onClick={handleTooltipOpen}
            />
          </Tooltip>
        </ClickAwayListener>
      ) : isSingleAddressWithLink ? (
        <LaunchOutlinedIcon
          titleAccess={t('profile.openAddress')}
          className={classes.actionIcon}
        />
      ) : isSingleAddress ? (
        <CopyContentIcon
          titleAccess={t('profile.copyAddress')}
          className={classes.actionIcon}
        />
      ) : (
        <ExpandMoreOutlinedIcon
          titleAccess={t('profile.viewAddress')}
          className={classes.actionIcon}
        />
      )}
    </div>
  );

  return (
    <div className={classes.root}>
      {filteredVersions && Object.values(filteredVersions).length > 1 ? (
        <>
          {item}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            transformOrigin={{horizontal: 'right', vertical: 'top'}}
            anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
            classes={{list: classes.menuList}}
          >
            {Object.keys(filteredVersions).map(version => (
              <MenuItem className={classes.menuItem} onClick={handleClose}>
                {getBlockScanUrl(currency, filteredVersions[version]) ? (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    onClick={() =>
                      handleSingleAddressClick(filteredVersions[version])
                    }
                  >
                    <LaunchOutlinedIcon
                      titleAccess={t('profile.openAddress')}
                      className={classes.menuActionIcon}
                    />
                    <Typography variant="body2">{version}</Typography>
                  </Box>
                ) : (
                  <CopyToClipboard
                    key={`${currency}_${version}`}
                    onCopy={
                      showTooltip && isOwner
                        ? undefined
                        : handleCryptoAddressCopied
                    }
                    stringToCopy={
                      showTooltip && isOwner ? '' : filteredVersions[version]
                    }
                  >
                    <Box display="flex">
                      <CopyContentIcon
                        titleAccess={t('profile.copyAddress')}
                        className={classes.menuActionIcon}
                      />
                      <Typography variant="body2">{version}</Typography>
                    </Box>
                  </CopyToClipboard>
                )}
              </MenuItem>
            ))}
          </Menu>
        </>
      ) : isSingleAddressWithLink ? (
        item
      ) : (
        <CopyToClipboard
          onCopy={handleCryptoAddressCopied}
          stringToCopy={address}
        >
          {item}
        </CopyToClipboard>
      )}
    </div>
  );
};

const isSupported = (currency: string): boolean => {
  return config.VERIFICATION_SUPPORTED.includes(currency.toUpperCase());
};

export default CryptoAddress;
