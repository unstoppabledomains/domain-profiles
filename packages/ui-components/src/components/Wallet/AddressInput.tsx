import CheckIcon from '@mui/icons-material/Check';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useRef, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getProfileData} from '../../actions';
import useResolverKeys from '../../hooks/useResolverKeys';
import {
  DomainFieldTypes,
  isDomainValidForManagement,
  isEmailValid,
  isValidIdentity,
  useTranslationContext,
} from '../../lib';
import {getMappedResolverKey} from '../../lib/types/resolverKeys';
import {getAddressMetadata} from '../Chat/protocol/resolution';
import ManageInput from '../Manage/common/ManageInput';
import {isValidMappedResolverKeyValue} from '../Manage/common/currencyRecords';
import {getRecordKeys} from '../Manage/common/verification/types';
import type {TokenEntry} from './Token';

const useStyles = makeStyles()((theme: Theme) => ({
  loader: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '8px',
  },
  checkIcon: {
    color: theme.palette.success.main,
    height: '16px',
    width: '16px',
  },
  resolvedContainer: {
    display: 'flex',
    alignItems: 'center',
    minHeight: '20px',
    marginTop: theme.spacing(1),
  },
  resolvedText: {
    color: theme.palette.neutralShades[600],
    marginLeft: theme.spacing(1),
  },
}));

type Props = {
  onAddressChange: (value: string) => void;
  onResolvedDomainChange: (value: string) => void;
  onInvitation?: (
    emailAddress: string,
  ) => Promise<Record<string, string> | undefined>;
  placeholder: string;
  initialResolvedDomainValue: string;
  initialAddressValue: string;
  label: string;
  asset: TokenEntry;
  createWalletEnabled?: boolean;
};

const AddressInput: React.FC<Props> = ({
  onAddressChange,
  onResolvedDomainChange,
  onInvitation,
  placeholder,
  initialAddressValue,
  initialResolvedDomainValue,
  label,
  asset,
  createWalletEnabled,
}) => {
  const [t] = useTranslationContext();
  const [address, setAddress] = useState<string>(initialAddressValue);
  const [resolvedDomain, setResolvedDomain] = useState<string>(
    initialResolvedDomainValue,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const {classes} = useStyles();
  const {mappedResolverKeys, loading: mappedResolverKeysLoading} =
    useResolverKeys();
  const timeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  const resolveDomain = async (
    addressOrDomain: string,
    symbol: string,
  ): Promise<string> => {
    if (!mappedResolverKeys) {
      return '';
    }

    // retrieve the domain onchain records
    const profileData = await getProfileData(addressOrDomain, [
      DomainFieldTypes.Records,
      DomainFieldTypes.CryptoVerifications,
    ]);

    // determine if the onchain key for requested symbol is present
    const recordKeys = getRecordKeys(symbol, mappedResolverKeys);
    return profileData?.records
      ? recordKeys.map(k => profileData.records![k]).find(k => k) || ''
      : '';
  };

  const validateAddress = (value: string) => {
    if (!mappedResolverKeys) {
      return false;
    }
    const validationSymbols = [asset.ticker, asset.symbol];
    for (const symbol of validationSymbols) {
      const recordKeys = getRecordKeys(symbol, mappedResolverKeys);
      if (recordKeys.length === 0) {
        continue;
      }
      const mappedKey = getMappedResolverKey(recordKeys[0], mappedResolverKeys);
      if (!mappedKey) {
        continue;
      }
      const isValid = isValidMappedResolverKeyValue(value, mappedKey);
      onAddressChange(isValid ? value : '');
      setError(!isValid);
      if (isValid) {
        return isValid;
      }
    }
    return false;
  };

  const handleInviteClick = async () => {
    if (onInvitation) {
      setIsLoading(true);
      if (createWalletEnabled) {
        setIsCreatingWallet(true);
        setErrorMessage('');
      }
      if ((await onInvitation(address)) && createWalletEnabled) {
        await onChange('', address);
      } else {
        setErrorMessage(t('wallet.inviteSendError'));
      }
      setIsLoading(false);
      if (createWalletEnabled) {
        setIsCreatingWallet(false);
      }
    }
  };

  const onChange = async (_id: string, addressOrDomain: string) => {
    onResolvedDomainChange('');
    onAddressChange('');
    setErrorMessage('');
    setError(false);
    setAddress(addressOrDomain);
    setResolvedDomain('');

    // clear the existing timeout
    if (timeout.current) {
      clearTimeout(timeout.current);
    }

    // reverse resolve address to name
    if (validateAddress(addressOrDomain)) {
      timeout.current = setTimeout(async () => {
        setIsLoading(true);
        const resolutionData = await getAddressMetadata(addressOrDomain);
        setIsLoading(false);
        if (resolutionData?.name) {
          setAddress(addressOrDomain);
          setResolvedDomain(resolutionData.name);
          onResolvedDomainChange(resolutionData.name);
          onAddressChange(addressOrDomain);
        }
      }, 500);
    }

    // forward resolve domain to address
    if (
      isDomainValidForManagement(addressOrDomain) ||
      isValidIdentity(addressOrDomain)
    ) {
      timeout.current = setTimeout(async () => {
        setIsLoading(true);
        const resolvedAddress =
          (await resolveDomain(addressOrDomain, asset.ticker)) ||
          (await resolveDomain(addressOrDomain, asset.symbol));
        setIsLoading(false);
        if (!resolvedAddress || !validateAddress(resolvedAddress)) {
          if (isEmailValid(addressOrDomain) && createWalletEnabled) {
            // set an empty resolution address, which will indicate that a new
            // wallet should be created for the validated identity
            setError(false);
            setAddress(addressOrDomain);
            onAddressChange(addressOrDomain);

            // set resolved domain to the validated identity
            setResolvedDomain(addressOrDomain);
            onResolvedDomainChange(addressOrDomain);
          } else {
            setErrorMessage(
              t('wallet.resolutionError', {assetSymbol: asset.ticker}),
            );
          }
          return;
        }
        setAddress(resolvedAddress);
        setResolvedDomain(addressOrDomain);
        onResolvedDomainChange(addressOrDomain);
        onAddressChange(resolvedAddress);
      }, 500);
    }
  };

  // wait for the resolver keys to load
  if (mappedResolverKeysLoading || !mappedResolverKeys) {
    return null;
  }

  // show the address input
  return (
    <Box>
      <ManageInput
        mt={2}
        id="address-input"
        value={address}
        label={label}
        placeholder={placeholder}
        onChange={onChange}
        disabled={isLoading}
        endAdornment={
          isCreatingWallet ? undefined : isLoading ? (
            <div className={classes.loader} data-testid="loader">
              <CircularProgress size={23} />
            </div>
          ) : error &&
            errorMessage &&
            createWalletEnabled &&
            onInvitation &&
            isEmailValid(address) ? (
            <Button variant="text" onClick={handleInviteClick}>
              {t('wallet.invite')}
            </Button>
          ) : undefined
        }
        errorText={errorMessage}
        error={error || !!errorMessage}
        stacked={true}
      />
      <Box className={classes.resolvedContainer}>
        {resolvedDomain && (
          <>
            <CheckIcon className={classes.checkIcon} />
            <Typography variant="caption" className={classes.resolvedText}>
              {resolvedDomain === address
                ? t('wallet.sendByEmail', {resolvedDomain})
                : t('wallet.resolvedDomain', {resolvedDomain})}
            </Typography>
          </>
        )}
        {isCreatingWallet && (
          <>
            <CircularProgress size={14} />
            <Typography variant="caption" className={classes.resolvedText}>
              {t('wallet.inviteInProgress')}
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
};

export default AddressInput;
