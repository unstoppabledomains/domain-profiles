import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import IconButton from '@mui/material/IconButton';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import useResolverKeys from '../../../hooks/useResolverKeys';
import type {
  CurrenciesType,
  SerializedPublicDomainProfileData,
  Web3Dependencies,
} from '../../../lib';
import {
  AllInitialCurrenciesEnum,
  CurrencyToName,
  useTranslationContext,
} from '../../../lib';
import type {ResolverKeyName} from '../../../lib/types/resolverKeys';
import {CryptoIcon} from '../../Image';
import ManageInput from './ManageInput';
import {isTokenDeprecated, isValidRecordKeyValue} from './currencyRecords';
import VerifyAdornment from './verification/VerifyAdornment';

export interface Props {
  currency: string;
  domain: string;
  ownerAddress: string;
  onChange: (key: ResolverKeyName, value: string) => void;
  onDelete: (keys: ResolverKeyName[]) => void;
  value: string;
  recordKey: ResolverKeyName;
  uiDisabled: boolean;
  profileData?: SerializedPublicDomainProfileData;
  setWeb3Deps: (value: Web3Dependencies | undefined) => void;
}

export const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    ...theme.containers.navigationBox,
  },
  subTitle: {
    color: theme.palette.blueGreyShades[400],
    fontSize: theme.typography.body2.fontSize,
    marginTop: theme.spacing(1),
  },
  link: {
    color: theme.palette.primaryShades[500],
    fontSize: theme.typography.body2.fontSize,
  },
  content: {
    padding: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(3),
    },
  },
  form: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    [theme.breakpoints.up('sm')]: {
      paddingTop: theme.spacing(4),
    },
  },
  formControl: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexDirection: 'column',
    marginTop: theme.spacing(3),
    '&:not(:last-of-type)': {
      marginBottom: theme.spacing(2),
    },
    [theme.breakpoints.up('sm')]: {
      marginTop: theme.spacing(2),
      marginLeft: '25%',
    },
  },
  formControlMultiChain: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  rightControlWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      justifyContent: 'flex-end',
    },
  },
  inputWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    marginTop: theme.spacing(2),
    width: 'inherit',
    [theme.breakpoints.up('sm')]: {
      justifyContent: 'flex-end',
    },
  },
  managedControlLabelWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formControlLabel: {
    minWidth: 90,
    minHeight: 36,
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.up('sm')]: {
      minHeight: 44,
    },
  },
  formControlLabelMultiChain: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    flex: '1 0 auto',
    justifyContent: 'space-between',
    marginTop: theme.spacing(2),
  },
  formControlLabelMultiChainIcon: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  multinput: {
    height: 44,
    width: '100%',
    paddingRight: '0px',
    '& input': {
      fontSize: theme.typography.body1.fontSize,
    },
    '&:not(:last-of-type)': {
      marginBottom: theme.spacing(2),
    },
  },
  multinputError: {
    flex: 1,
    margin: theme.spacing(-1, 0, 2),
  },
  input: {
    borderRadius: theme.shape.borderRadius,
    borderLeft: `1px solid ${theme.palette.neutralShades[300]}`,
  },
  inputAdornment: {
    textAlign: 'center',
    fontSize: '0.8125rem',
    fontWeight: theme.typography.fontWeightBold,
    padding: theme.spacing(0, 1),
    border: '1px solid',
    borderColor: theme.palette.greyShades[100],
    borderRadius: theme.shape.borderRadius,
    marginRight: theme.spacing(1.5),
    userSelect: 'none',
    [theme.breakpoints.up('sm')]: {
      minWidth: 80,
    },
  },
  currency: {
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
    [theme.breakpoints.up('sm')]: {
      fontSize: theme.typography.body1.fontSize,
    },
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  currencyIconContainer: {
    width: 20,
    height: 20,
    marginRight: theme.spacing(1),
    [theme.breakpoints.up('sm')]: {
      width: 24,
      height: 24,
      marginRight: theme.spacing(1.5),
    },
  },
  currencyIcon: {
    width: 'inherit',
    height: 'inherit',
  },
  removeButtonContainer: {
    display: 'flex',
    alignItems: 'center',
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.greyShades[400],
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(2),
    },
    [theme.breakpoints.up('sm')]: {
      marginRight: theme.spacing(0.5),
    },
  },
  removeCaption: {
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
  removeButton: {
    width: 36,
    height: 36,
    color: 'inherit',
    padding: 0,
    [theme.breakpoints.up('sm')]: {
      width: 44,
      height: 44,
      padding: theme.spacing(1),
    },
  },
  removeIcon: {
    width: 20,
    height: 20,
    [theme.breakpoints.up('sm')]: {
      width: 24,
      height: 24,
    },
  },
}));

const CurrencyInput: React.FC<Props> = ({
  currency,
  domain,
  ownerAddress,
  onChange,
  onDelete,
  value,
  recordKey,
  uiDisabled,
  profileData,
  setWeb3Deps,
}) => {
  const [t] = useTranslationContext();
  const {classes} = useStyles();
  const [address, setAddress] = useState(value);
  const [isError, setIsError] = useState(false);
  const initial = Boolean(AllInitialCurrenciesEnum[currency]);
  const {unsResolverKeys, ensResolverKeys} = useResolverKeys();
  const resolverKeys = unsResolverKeys;
  const isDeprecated = isTokenDeprecated(recordKey, resolverKeys);
  const currencyName = CurrencyToName[currency] || currency;
  const placeholder = t('manage.enterYourAddress', {currency: currencyName});

  const handleChange = (_key: string, newValue: string) => {
    const isValid =
      !newValue || isValidRecordKeyValue(recordKey, newValue, resolverKeys);
    setAddress(newValue);
    setIsError(!isValid);
    // Allowing empty values to delete the record
    if (!newValue || isValid) {
      onChange(recordKey, newValue);
    }
  };

  const handleDelete = () => {
    // Small convenience: if this is an initial coin, the delete button simply clears the value
    if (initial) {
      handleChange(recordKey, '');
      return;
    }
    onDelete([recordKey]);
  };

  useEffect(() => {
    setAddress(value);
  }, [value]);

  return (
    <ManageInput
      id={currency}
      label={
        <div className={classes.managedControlLabelWrapper}>
          <div className={classes.formControlLabel}>
            <div className={classes.currencyIconContainer}>
              <CryptoIcon
                currency={currency as CurrenciesType}
                classes={{root: classes.currencyIcon}}
              />
            </div>
            <span className={classes.currency} title={currencyName}>
              {currencyName}
            </span>
          </div>

          {(!initial || (initial && Boolean(address))) && (
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
          )}
        </div>
      }
      value={address}
      error={isError}
      errorText={t('manage.enterValidAddress')}
      placeholder={placeholder}
      onChange={handleChange}
      disabled={uiDisabled}
      deprecated={isDeprecated}
      classes={{
        input: classes.input,
      }}
      stacked={true}
      endAdornment={
        <VerifyAdornment
          addressCurrent={address}
          domain={domain}
          ownerAddress={ownerAddress}
          profileData={profileData}
          currency={currency}
          setWeb3Deps={setWeb3Deps}
          uiDisabled={uiDisabled}
        />
      }
    />
  );
};

export default CurrencyInput;
