import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Button from '@mui/material/Button';
import Hidden from '@mui/material/Hidden';
import type {Theme} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, {useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import useTranslationContext from '../../lib/i18n';
import type {AllCurrenciesType} from '../../lib/types/blockchain';
import type {SerializedPublicDomainProfileData} from '../../lib/types/domain';
import type {ParsedRecords} from '../../lib/types/records';
import CryptoAddress from './CryptoAddress';

const MAX_ADDRESSES_VISIBLE = 4;

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    position: 'relative',
    marginTop: theme.spacing(3),
    minHeight: 35,
  },
  parentRow: {
    position: 'absolute',
    top: 0,
    left: `-${theme.spacing(2)}`,
    paddingLeft: theme.spacing(2),
    display: 'flex',
    overflowY: 'hidden',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    maxWidth: `calc(100% + ${theme.spacing(4)})`,
    [theme.breakpoints.up('md')]: {
      position: 'relative',
      flexWrap: 'wrap',
      top: 'initial',
      left: 'initial',
      paddingLeft: 'initial',
      overflow: 'initial',
    },
  },
  showAllButton: {
    color: theme.palette.neutralShades[600],
    fontSize: theme.typography.body2.fontSize,
  },
}));

export type Props = {
  records: ParsedRecords;
  profileData?: SerializedPublicDomainProfileData | null;
  ownerAddress?: string;
  showWarning?: boolean;
  domain?: string;
  isOwner?: boolean;
  onCryptoAddressCopied: () => void;
};

const CryptoAddresses: React.FC<Props> = ({
  records,
  profileData,
  ownerAddress,
  domain,
  showWarning,
  isOwner,
  onCryptoAddressCopied: handleCryptoAddressCopied,
}) => {
  const {classes} = useStyles();
  const theme = useTheme();
  const [t] = useTranslationContext();
  const isTabletOrMobile = useMediaQuery(theme.breakpoints.down('md'));
  const {addresses = {}, multicoinAddresses = {}} = records;
  const [showWholeList, setShowWholeList] = useState(false);
  let addressList = Object.keys(addresses);
  let multicoinAddressList = Object.keys(multicoinAddresses);
  const isToggleButtonVisible =
    showWholeList ||
    addressList.length + multicoinAddressList.length > MAX_ADDRESSES_VISIBLE;

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
            const currency = curr as AllCurrenciesType;

            return (
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
            );
          })}
          {multicoinAddressList.map(curr => {
            const currency = curr as AllCurrenciesType;
            const versions = multicoinAddresses[currency];

            return (
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
export {default as CryptoAddress} from './CryptoAddress';
