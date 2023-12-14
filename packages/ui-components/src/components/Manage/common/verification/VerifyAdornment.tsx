import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';
import useIsMounted from 'react-is-mounted-hook';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import type {
  SerializedPublicDomainProfileData,
  Web3Dependencies,
} from '../../../../lib';
import {useTranslationContext} from '../../../../lib';
import {getVerificationProvider} from './provider';

const useStyles = makeStyles()((theme: Theme) => ({
  text: {
    textTransform: 'capitalize',
  },
  lastButton: {
    marginRight: theme.spacing(1),
  },
  unverifiedBlock: {
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },
  verifiedBlock: {
    display: 'flex',
    alignContent: 'center',
    paddingRight: theme.spacing(1.75),
    paddingLeft: theme.spacing(1),
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.successShades[700],
  },
  verifiedIcon: {
    color: theme.palette.successShades[700],
  },
}));

export type Props = {
  addressCurrent: string;
  currency: string;
  domain: string;
  ownerAddress: string;
  uiDisabled: boolean;
  profileData?: SerializedPublicDomainProfileData;
  setWeb3Deps: (value: Web3Dependencies | undefined) => void;
};

const VerifyAdornment: React.FC<Props> = ({
  addressCurrent,
  currency,
  domain,
  ownerAddress,
  profileData,
  uiDisabled,
  setWeb3Deps,
}) => {
  const [t] = useTranslationContext();
  const {classes} = useStyles();
  const [verifiedAddress, setVerifiedAddress] = useState<string>('');
  const [addressOriginal, setAddressOriginal] = useState(addressCurrent);
  const isMounted = useIsMounted();

  // update original address after ui is re-enabled
  useEffect(() => {
    if (!uiDisabled) {
      setAddressOriginal(addressCurrent);
    }
  }, [uiDisabled]);

  // load existing verifications from profile data
  useEffect(() => {
    // wait for prerequisites to be met
    if (!currency || !addressCurrent || !isMounted() || verifiedAddress) {
      return;
    }

    // determine if address has already been verified
    const renderVerificationStatus = async (): Promise<void> => {
      let isVerified = false;
      profileData?.cryptoVerifications?.forEach(verification => {
        if (
          verification.symbol.toLowerCase() === currency.toLowerCase() &&
          verification.address.toLowerCase() === addressCurrent.toLowerCase()
        ) {
          // set the verified address state
          isVerified = true;
          setVerifiedAddress(addressCurrent);
        }
      });
    };
    void renderVerificationStatus();
  }, [isMounted, currency, addressCurrent, addressOriginal, verifiedAddress]);

  if (!isSupported(currency)) {
    // return a specific test ID if feature is disabled
    return <div data-testid={`verifyDisabled-${currency}`}></div>;
  } else if (
    (verifiedAddress &&
      verifiedAddress.toLowerCase() === addressCurrent.toLowerCase()) ||
    ownerAddress.toLowerCase() === addressCurrent.toLowerCase()
  ) {
    // return verified indicator
    return (
      <div className={classes.verifiedBlock}>
        <Tooltip title={t('manage.verifiedOwnership')}>
          <CheckCircleIcon className={classes.verifiedIcon} />
        </Tooltip>
      </div>
    );
  } else {
    // return the verification button
    return (
      <div className={classes.unverifiedBlock}>
        {addressCurrent &&
          (addressCurrent === addressOriginal && !uiDisabled ? (
            getVerificationProvider({
              address: addressCurrent,
              currency,
              domain,
              setVerified: setVerifiedAddress,
              setWeb3Deps,
            })
          ) : (
            <Tooltip title={t('manage.verifyAfterConfirm', {currency})}>
              <div>
                {' '}
                <Button
                  data-testid={`verifyAfterConfirm-${currency}`}
                  disabled={true}
                >
                  {t('manage.verify')}
                </Button>
              </div>
            </Tooltip>
          ))}
      </div>
    );
  }
};

const isSupported = (currency: string): boolean => {
  return config.VERIFICATION_SUPPORTED.includes(currency.toUpperCase());
};

export default VerifyAdornment;
