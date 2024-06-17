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
  isEmailValid,
  isValidDomain,
  isValidIdentity,
  useTranslationContext,
} from '../../lib';
import type {ResolverKeyName} from '../../lib/types/resolverKeys';
import {getAddressMetadata} from '../Chat/protocol/resolution';
import ManageInput from '../Manage/common/ManageInput';
import {isValidRecordKeyValue} from '../Manage/common/currencyRecords';

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

const getRecordKey = (symbol: string): ResolverKeyName => {
  if (symbol === 'MATIC') {
    return `crypto.MATIC.version.MATIC.address`;
  }
  return `crypto.${symbol}.address` as ResolverKeyName;
};

type Props = {
  onAddressChange: (value: string) => void;
  onResolvedDomainChange: (value: string) => void;
  onInvitation?: (emailAddress: string) => Promise<void>;
  placeholder: string;
  initialResolvedDomainValue: string;
  initialAddressValue: string;
  label: string;
  assetSymbol: string;
};

const AddressInput: React.FC<Props> = ({
  onAddressChange,
  onResolvedDomainChange,
  onInvitation,
  placeholder,
  initialAddressValue,
  initialResolvedDomainValue,
  label,
  assetSymbol,
}) => {
  const [t] = useTranslationContext();
  const [address, setAddress] = useState<string>(initialAddressValue);
  const [resolvedDomain, setResolvedDomain] = useState<string>(
    initialResolvedDomainValue,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const {classes} = useStyles();
  const {unsResolverKeys} = useResolverKeys();
  const timeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  const resolveDomain = async (addressOrDomain: string): Promise<string> => {
    const recordKey = getRecordKey(assetSymbol);
    const profileData = await getProfileData(addressOrDomain, [
      DomainFieldTypes.Records,
      DomainFieldTypes.CryptoVerifications,
    ]);
    const recordValue = profileData?.records
      ? profileData?.records[recordKey]
      : '';
    return recordValue;
  };

  const validateAddress = (value: string) => {
    const recordKey = getRecordKey(assetSymbol);
    const isValid = isValidRecordKeyValue(recordKey, value, unsResolverKeys);
    onAddressChange(isValid ? value : '');
    setError(!isValid);
    return isValid;
  };

  const handleInviteClick = async () => {
    if (onInvitation) {
      setIsLoading(true);
      await onInvitation(address);
      setIsLoading(false);
    }
  };

  const onChange = async (id: string, addressOrDomain: string) => {
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
    if (isValidDomain(addressOrDomain) || isValidIdentity(addressOrDomain)) {
      timeout.current = setTimeout(async () => {
        setIsLoading(true);
        const resolvedAddress = await resolveDomain(addressOrDomain);
        setIsLoading(false);
        if (!resolvedAddress || !validateAddress(resolvedAddress)) {
          setErrorMessage(t('wallet.resolutionError', {assetSymbol}));
          return;
        }
        setAddress(resolvedAddress);
        setResolvedDomain(addressOrDomain);
        onResolvedDomainChange(addressOrDomain);
        onAddressChange(resolvedAddress);
      }, 500);
    }
  };

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
          isLoading ? (
            <div className={classes.loader} data-testid="loader">
              <CircularProgress size={23} />
            </div>
          ) : error && errorMessage && onInvitation && isEmailValid(address) ? (
            <Button variant="text" size="small" onClick={handleInviteClick}>
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
              Successfully resolved {resolvedDomain}
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
};

export default AddressInput;
