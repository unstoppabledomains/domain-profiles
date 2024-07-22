import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import type {ChangeEvent} from 'react';
import React, {Fragment, useEffect, useState} from 'react';

import useResolverKeys from '../../../hooks/useResolverKeys';
import type {
  CurrenciesType,
  DomainRawRecords,
  MultiChainAddressVersion,
  SerializedPublicDomainProfileData,
  Web3Dependencies,
} from '../../../lib';
import {CurrencyToName, useTranslationContext} from '../../../lib';
import type {
  MultichainKeyToLocaleKeyKeys,
  ResolverKeyName,
} from '../../../lib/types/resolverKeys';
import {MultichainKeyToLocaleKey} from '../../../lib/types/resolverKeys';
import {CryptoIcon} from '../../Image';
import {useStyles} from './CurrencyInput';
import FormError from './FormError';
import {isTokenDeprecated, isValidRecordKeyValue} from './currencyRecords';
import VerifyAdornment from './verification/VerifyAdornment';

type Props = {
  currency: CurrenciesType;
  domain: string;
  ownerAddress: string;
  versions: MultiChainAddressVersion[];
  onChange: (key: ResolverKeyName, value: string) => void;
  onDelete: (keys: ResolverKeyName[]) => void;
  profileData?: SerializedPublicDomainProfileData;
  uiDisabled: boolean;
  setWeb3Deps: (value: Web3Dependencies | undefined) => void;
  saveClicked: boolean;
  hideEndAdornment?: boolean;
};

const MultiChainInput: React.FC<Props> = ({
  currency,
  domain,
  ownerAddress,
  onChange,
  versions,
  onDelete,
  profileData,
  uiDisabled,
  setWeb3Deps,
  saveClicked,
  hideEndAdornment,
}) => {
  const [t] = useTranslationContext();
  const {classes} = useStyles();
  const isSingleVersion = versions.length === 1;
  const defaultValues = versions.reduce(
    (acc, {key, value}) => ({...acc, [key]: value}),
    {},
  );

  const {unsResolverKeys} = useResolverKeys(); // Only UNS records can be multi-chain
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [values, setValues] = useState<DomainRawRecords>(defaultValues);

  const handleDelete = () => {
    onDelete(versions.map(({key}) => key));
  };

  useEffect(() => {
    setValues(defaultValues);
  }, [versions]);

  return (
    <div className={classes.formControlMultiChain}>
      <Grid container>
        <Grid item xs={12}>
          <label
            htmlFor={currency}
            className={classes.formControlLabelMultiChain}
          >
            <div className={classes.formControlLabelMultiChainIcon}>
              <div className={classes.currencyIconContainer}>
                <CryptoIcon
                  currency={currency}
                  classes={{root: classes.currencyIcon}}
                />
              </div>
              <span className={classes.currency}>
                {(CurrencyToName as Record<CurrenciesType, string>)[currency] ||
                  currency}
              </span>
            </div>

            <div className={classes.removeButtonContainer}>
              <span className={classes.removeCaption}>
                {t('common.delete')}
              </span>
              <IconButton
                className={classes.removeButton}
                onClick={handleDelete}
                disabled={uiDisabled}
                size="large"
              >
                <DeleteOutlineIcon className={classes.removeIcon} />
              </IconButton>
            </div>
          </label>
        </Grid>
        <Grid item xs={12}>
          <div className={classes.rightControlWrapper}>
            <div className={classes.inputWrapper}>
              {versions.map(({key, version, value = ''}) => {
                const isDeprecated = isTokenDeprecated(key, unsResolverKeys);

                const handleChange = ({
                  target,
                }: ChangeEvent<HTMLInputElement>) => {
                  const newValue = target.value.trim();
                  const isValid =
                    !newValue ||
                    isValidRecordKeyValue(key, newValue, unsResolverKeys);

                  setValues({...values, [key]: newValue});
                  setErrors({...errors, [key]: !isValid});
                  // Allowing empty values to delete the record
                  if (!newValue || isValid) {
                    onChange(key, newValue);
                  }
                };

                const _key = key as MultichainKeyToLocaleKeyKeys;
                const placeholder = t('manage.enterYourAddress', {
                  currency:
                    (MultichainKeyToLocaleKey[_key] &&
                      t(MultichainKeyToLocaleKey[_key])) ||
                    (CurrencyToName as Record<CurrenciesType, string>)[
                      currency
                    ] ||
                    currency,
                });

                return (
                  <Fragment key={key}>
                    <OutlinedInput
                      placeholder={placeholder}
                      onChange={handleChange}
                      id={currency}
                      error={errors[key]}
                      className={classes.multinput}
                      value={values[key]}
                      disabled={uiDisabled}
                      startAdornment={
                        isSingleVersion ? undefined : (
                          <span className={classes.inputAdornment}>
                            {version}
                          </span>
                        )
                      }
                      endAdornment={
                        hideEndAdornment ? undefined : (
                          <VerifyAdornment
                            addressCurrent={value}
                            domain={domain}
                            ownerAddress={ownerAddress}
                            profileData={profileData}
                            currency={currency}
                            setWeb3Deps={setWeb3Deps}
                            uiDisabled={false}
                            saveClicked={saveClicked}
                          />
                        )
                      }
                    />
                    {(errors[key] || isDeprecated) && (
                      <div className={classes.multinputError}>
                        <FormError
                          message={
                            isDeprecated
                              ? t('manage.legacyToken')
                              : t('manage.enterValidAddress')
                          }
                          severity={isDeprecated ? 'warning' : 'error'}
                        />
                      </div>
                    )}
                  </Fragment>
                );
              })}
            </div>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default MultiChainInput;
