import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Hidden from '@mui/material/Hidden';
import type {Theme} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, {useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import useTranslationContext from '../../lib/i18n';
import type {CurrenciesType} from '../../lib/types/blockchain';
import type {SerializedPublicDomainProfileData} from '../../lib/types/domain';
import type {ParsedRecords} from '../../lib/types/records';
import CryptoAddress from './CryptoAddress';

const MAX_ADDRESSES_VISIBLE = 4;

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    position: 'relative',
    marginTop: theme.spacing(1),
    minHeight: 35,
  },
  parentRow: {
    display: 'flex',
    whiteSpace: 'nowrap',
    marginLeft: theme.spacing(0),
    flexWrap: 'wrap',
    paddingLeft: 'initial',
    overflow: 'initial',
    [theme.breakpoints.down('md')]: {
      justifyContent: 'center',
    },
  },
  cryptoContainer: {
    [theme.breakpoints.down('md')]: {
      marginTop: theme.spacing(1),
    },
  },
  showAllButton: {
    color: theme.palette.neutralShades[600],
    fontSize: theme.typography.body2.fontSize,
  },
}));

export {default as CryptoAddress} from './CryptoAddress';

const CryptoAddresses: React.FC<Props> = ({
  records,
  profileData,
  ownerAddress,
  domain,
  showWarning,
  isOwner,
  onCryptoAddressCopied: handleCryptoAddressCopied,
  showAll,
}) => {
  const {classes} = useStyles();
  const theme = useTheme();
  const [t] = useTranslationContext();
  const isTabletOrMobile = useMediaQuery(theme.breakpoints.down('md'));
  const {addresses = {}, multicoinAddresses = {}} = records;
  const [showWholeList, setShowWholeList] = useState(showAll || false);
  let addressList = Object.keys(addresses);
  let multicoinAddressList = Object.keys(multicoinAddresses);
  const isToggleButtonVisible =
    !showAll &&
    (showWholeList ||
      addressList.length + multicoinAddressList.length > MAX_ADDRESSES_VISIBLE);

  if (!isTabletOrMobile && !showWholeList) {
    addressList = addressList.slice(0, MAX_ADDRESSES_VISIBLE);

    if (addressList.length < MAX_ADDRESSES_VISIBLE) {
      multicoinAddressList = multicoinAddressList.slice(
        0,
        MAX_ADDRESSES_VISIBLE - addressList.length,
      );
    } else {
      multicoinAddressList = [];
    }
  }

  const handleListCollapsing = () => {
    setShowWholeList(!showWholeList);
  };

  return (
    <>
      <div className={classes.container}>
        <div className={classes.parentRow}>
          {addressList.map(curr => {
            const currency = curr as CurrenciesType;

            return (
              <Box className={classes.cryptoContainer}>
                <CryptoAddress
                  key={currency}
                  currency={currency}
                  profileData={profileData}
                  showWarning={showWarning}
                  domain={domain}
                  isOwner={isOwner}
                  ownerAddress={ownerAddress}
                  singleAddress={addresses[currency]}
                  onCryptoAddressCopied={handleCryptoAddressCopied}
                />
              </Box>
            );
          })}
          {multicoinAddressList.map(curr => {
            const currency = curr as CurrenciesType;
            const versions = multicoinAddresses[currency];

            return (
              <Box className={classes.cryptoContainer}>
                <CryptoAddress
                  key={currency}
                  versions={versions}
                  currency={currency}
                  profileData={profileData}
                  showWarning={showWarning}
                  domain={domain}
                  isOwner={isOwner}
                  ownerAddress={ownerAddress}
                  onCryptoAddressCopied={handleCryptoAddressCopied}
                />
              </Box>
            );
          })}
        </div>
      </div>
      <Hidden mdDown implementation="css">
        {isToggleButtonVisible && (
          <Button
            className={classes.showAllButton}
            startIcon={
              showWholeList ? (
                <KeyboardArrowUpIcon />
              ) : (
                <KeyboardArrowDownIcon />
              )
            }
            onClick={handleListCollapsing}
          >
            {showWholeList ? t('profile.collapse') : t('profile.showAll')}
          </Button>
        )}
      </Hidden>
    </>
  );
};

export default CryptoAddresses;
export type Props = {
  records: ParsedRecords;
  profileData?: SerializedPublicDomainProfileData | null;
  ownerAddress?: string;
  showWarning?: boolean;
  domain?: string;
  isOwner?: boolean;
  showAll?: boolean;
  onCryptoAddressCopied: () => void;
};
