import CircularProgress from '@mui/material/CircularProgress';
import type {Theme} from '@mui/material/styles';
import React, {useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getProfileData} from '../../../../actions';
import useResolverKeys from '../../../../hooks/useResolverKeys';
import {DomainFieldTypes, isValidDomain} from '../../../../lib';
import type {ResolverKeyName} from '../../../../lib/types/resolverKeys';
import ManageInput from '../../common/ManageInput';
import {isValidRecordKeyValue} from '../../common/currencyRecords';

const useStyles = makeStyles()((theme: Theme) => ({
  loader: {
    marginRight: '8px',
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
  placeholder: string;
  label: string;
  assetSymbol: string;
};

const AddressInput: React.FC<Props> = ({
  onAddressChange,
  onResolvedDomainChange,
  placeholder,
  label,
  assetSymbol,
}) => {
  const [address, setAddress] = useState<string>('');
  const [resolvedDomain, setResolvedDomain] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const {classes} = useStyles();
  const {unsResolverKeys} = useResolverKeys();

  const resolveDomain = async (
    addressOrDomain: string,
    symbol: string,
  ): Promise<string> => {
    const recordKey = getRecordKey(symbol);
    setIsLoading(true);
    const profileData = await getProfileData(addressOrDomain, [
      DomainFieldTypes.Records,
    ]);
    const recordValue = profileData?.records
      ? profileData?.records[recordKey]
      : '';
    setIsLoading(false);
    return recordValue;
  };

  const validateAddress = (symbol: string, value: string) => {
    const recordKey = getRecordKey(symbol);
    const isValid = isValidRecordKeyValue(recordKey, value, unsResolverKeys);
    onAddressChange(isValid ? value : '');
    setError(!isValid);
    return isValid;
  };

  const onChange = async (id: string, addressOrDomain: string) => {
    onResolvedDomainChange('');
    onAddressChange('');
    setErrorMessage('');
    setAddress(addressOrDomain);
    setResolvedDomain('');

    if (!isValidDomain(addressOrDomain)) {
      validateAddress(assetSymbol, addressOrDomain);
      return;
    }
    const resolvedAddress = await resolveDomain(addressOrDomain, assetSymbol);
    if (!resolvedAddress || !validateAddress(assetSymbol, resolvedAddress)) {
      setErrorMessage(
        `Could not resolve ${addressOrDomain} to a valid ${assetSymbol} address`,
      );
      return;
    }
    setAddress(resolvedAddress);
    setResolvedDomain(addressOrDomain);
    onResolvedDomainChange(addressOrDomain);
    onAddressChange(resolvedAddress);
  };

  return (
    <ManageInput
      id="address-input"
      value={address}
      label={label}
      placeholder={placeholder}
      onChange={onChange}
      disabled={isLoading}
      endAdornment={
        isLoading ? (
          <div className={classes.loader}>
            <CircularProgress size={23} />
          </div>
        ) : undefined
      }
      helperText={
        resolvedDomain ? `Successfully resolved ${resolvedDomain}` : undefined
      }
      errorText={errorMessage}
      error={error || !!errorMessage}
      stacked={true}
    />
  );
};

export default AddressInput;