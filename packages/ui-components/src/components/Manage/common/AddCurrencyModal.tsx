import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import useResolverKeys from '../../../hooks/useResolverKeys';
import type {CurrenciesType, NewAddressRecord} from '../../../lib';
import {useTranslationContext} from '../../../lib';
import {CryptoIcon} from '../../Image';
import FormError from './FormError';
import {getAllAddressRecords} from './currencyRecords';

const useStyles = makeStyles<void, 'error'>()(
  (theme: Theme, _params, classes) => ({
    dialogRoot: {
      width: '100%',
      maxWidth: 380,
      minHeight: 624,
      paddingBottom: 0,
    },
    modalHeader: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing(1.5),
      paddingLeft: theme.spacing(3),
    },
    modalTitle: {
      fontSize: '1.125rem',
      fontWeight: theme.typography.fontWeightBold,
    },
    searchIcon: {
      color: theme.palette.neutralShades[400],
    },
    input: {
      height: 44,
      borderRadius: theme.shape.borderRadius,
      backgroundColor: theme.palette.common.white,
      border: `1px solid ${theme.palette.neutralShades[300]}`,
      padding: theme.spacing(1, 1.5),
      margin: theme.spacing(0, 3),
      marginBottom: theme.spacing(1),
      fontSize: '1rem',
      width: 'auto',
      transition: theme.transitions.create('border-color'),
      '&:before': {
        display: 'none',
      },
      [`&.${classes.error}`]: {
        borderRadius: theme.shape.borderRadius,
        borderColor: 'red',
      },
    },
    error: {
      borderRadius: theme.shape.borderRadius,
      border: '1px solid red',
    },
    currencyList: {
      overflow: 'auto',
      maxHeight: 500,
    },
    currencyListEmpty: {
      padding: theme.spacing(3, 3),
      textAlign: 'center',
    },
    currencyItem: {
      position: 'relative',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing(2, 3),
      transition: theme.transitions.create('background-color'),
      '&:hover': {
        backgroundColor: theme.palette.greyShades[50],
      },
      '&:not(:last-of-type):after': {
        content: `""`,
        position: 'absolute',
        left: 76,
        bottom: 0,
        width: 'calc(100% - 100px)',
        height: 1,
        backgroundColor: theme.palette.greyShades[50],
      },
    },
    currencyTitleWrapper: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: theme.spacing(1),
      [theme.breakpoints.up('sm')]: {
        marginBottom: theme.spacing(0),
      },
    },
    currencyTitle: {
      fontSize: '1rem',
      fontWeight: theme.typography.fontWeightMedium,
    },
    currencyIconContainer: {
      width: 40,
      height: 40,
      marginRight: theme.spacing(1.5),
    },
    currencyIcon: {
      width: 'inherit',
      height: 'inherit',
    },
  }),
);

type Props = {
  open: boolean;
  onClose: () => void;
  onAddNewAddress: (address: NewAddressRecord) => void;
  isEns: boolean;
};

const AddCurrencyModal: React.FC<Props> = ({
  open,
  onClose,
  onAddNewAddress,
}) => {
  const {mappedResolverKeys} = useResolverKeys();
  const validCoins = getAllAddressRecords(mappedResolverKeys).filter(key =>
    key.versions.every(v => !v.deprecated),
  );
  const [t] = useTranslationContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCoins, setFilteredCoins] = useState<NewAddressRecord[]>([]);
  const {classes} = useStyles();

  const coinsToRender = searchQuery ? filteredCoins : validCoins;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClose = () => {
    setFilteredCoins([]);
    onClose();
  };

  const handleSelectCoin = (newAddressRecord: NewAddressRecord) => {
    onAddNewAddress(newAddressRecord);
    setFilteredCoins([]);
    onClose();
  };

  useEffect(() => {
    if (!searchQuery) {
      setFilteredCoins([]);
      return;
    }

    setFilteredCoins(
      validCoins.filter(({shortName: currency, name, versions}) => {
        const searchValue = searchQuery.toLowerCase();

        return (
          currency.toLowerCase().includes(searchValue) ||
          name?.toLowerCase().includes(searchValue) ||
          versions.find(v => v.key.toLowerCase().includes(searchValue))
        );
      }),
    );
  }, [searchQuery]);

  const renderCoin = ({
    shortName: currency,
    name,
    versions,
  }: NewAddressRecord) => (
    <div
      key={versions.map(v => v.key).join()}
      className={classes.currencyItem}
      onClick={() => handleSelectCoin({shortName: currency, name, versions})}
    >
      <div className={classes.currencyTitleWrapper}>
        <div className={classes.currencyIconContainer}>
          <CryptoIcon
            currency={currency as CurrenciesType}
            className={classes.currencyIcon}
            lazyLoad={true}
          />
        </div>
        <div>
          <div className={classes.currencyTitle}>{name}</div>
          <div>
            {currency}
            {versions.length > 0 && versions.every(v => v.deprecated) && (
              <FormError message={t('manage.legacyToken')} severity="warning" />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      classes={{paper: classes.dialogRoot}}
    >
      <div className={classes.modalHeader}>
        <Typography className={classes.modalTitle}>
          {t('manage.addCurrency')}
        </Typography>
        <IconButton onClick={onClose} size="large">
          <CloseIcon />
        </IconButton>
      </div>
      <InputBase
        autoFocus
        placeholder={t('manage.searchPlaceholder')}
        className={classes.input}
        startAdornment={
          <InputAdornment position="start" className={classes.searchIcon}>
            <SearchIcon />
          </InputAdornment>
        }
        onChange={handleSearch}
      />
      <div className={classes.currencyList}>
        {searchQuery && !coinsToRender.length && (
          <div className={classes.currencyListEmpty}>
            {t('manage.noCurrenciesFound')}
          </div>
        )}
        {coinsToRender.map(renderCoin)}
      </div>
    </Dialog>
  );
};

export default AddCurrencyModal;
