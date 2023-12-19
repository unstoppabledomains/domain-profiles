import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {useRouter} from 'next/router';
import React, {useEffect, useRef, useState} from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {searchProfiles} from '../../actions/domainProfileActions';
import {DomainPreview} from '../../components/Domain/DomainPreview';
import useTranslationContext from '../../lib/i18n';
import type {Web3Dependencies} from '../../lib/types/web3';

const useStyles = makeStyles<{
  focus: boolean;
  variant: ProfileSearchBarVariant;
}>()((theme: Theme, {focus, variant}) => ({
  container: {
    display: 'flex',
    width: '100%',
    height: variant === 'homepage' ? '60px' : '40px',
  },
  inputBase: {
    border: `1px solid ${
      variant === 'homepage'
        ? theme.palette.neutralShades[400]
        : focus
        ? 'rgba(255, 255, 255, 0.50)'
        : 'rgba(255, 255, 255, 0.10)'
    }`,
    borderRadius: theme.shape.borderRadius,
    paddingLeft: variant === 'homepage' ? theme.spacing(2) : theme.spacing(1),
    backdropFilter: 'blur(5px)',
    backgroundColor:
      variant === 'homepage' ? 'white' : 'rgba(255, 255, 255, 0.20)',
    boxShadow: variant === 'homepage' ? theme.shadows[6] : undefined,
  },
  input: {
    fontSize: variant === 'homepage' ? 20 : 16,
    color:
      variant === 'homepage'
        ? focus
          ? theme.palette.common.black
          : theme.palette.neutralShades[400]
        : theme.palette.common.white,
    '&::-webkit-search-cancel-button': {
      WebkitAppearance: 'none',
    },
    '&::placeholder': {
      color:
        variant === 'homepage'
          ? theme.palette.neutralShades[400]
          : theme.palette.common.white,
      opacity: 1,
    },
    '&::-webkit-input-placeholder': {
      color:
        variant === 'homepage'
          ? theme.palette.neutralShades[400]
          : theme.palette.common.white,
      opacity: 1,
    },
  },
  searchButton: {
    minWidth: 'initial',
    transition: 'none',
    padding: theme.spacing(1),
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  disabledSearchButton: {
    backgroundColor: `${theme.palette.neutralShades[100]} !important`,
  },
  loader: {
    padding: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '16px',
    width: '16px',
  },
  searchResultsContainer: {
    width: variant === 'homepage' ? '650px' : '512px',
    backgroundColor: theme.palette.white,
    border: `1px solid ${theme.palette.neutralShades[100]}`,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 10,
    position: 'absolute',
    marginTop: variant === 'homepage' ? theme.spacing(10) : theme.spacing(6),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
  searchResultsTitle: {
    fontSize: 14,
    fontWeight: 600,
    paddingLeft: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    paddingTop: theme.spacing(1),
  },
  searchResult: {
    padding: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.neutralShades[100],
    },
    '&:not(:last-child)': {
      borderBottom: `1px dashed ${theme.palette.neutralShades[100]}`,
    },
  },
  searchResultText: {
    fontWeight: 600,
    wordBreak: 'break-all',
    maxWidth: 'calc(100% - 60px)',
    marginLeft: theme.spacing(2),
  },
  searchResultLeft: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
  },
  closeIcon: {
    color:
      variant === 'homepage' ? theme.palette.neutralShades[400] : '#FFFFFF80',
    height: '16px',
    width: '16px',
  },
  searchIcon: {
    color:
      variant === 'homepage'
        ? theme.palette.neutralShades[400]
        : theme.palette.white,
    width: 24,
    height: 24,
    margin: theme.spacing(1),
  },
  rightIcon: {
    color: theme.palette.neutralShades[400],
  },
  searchRightBox: {
    display: 'flex',
    height: '100%',
    alignItems: 'center',
  },
  searchIconContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor:
      variant === 'homepage' ? theme.palette.primary.main : theme.palette.white,
    height: '100%',
    borderRadius: '0px 7px 7px 0px',
    cursor: 'pointer',
  },
  searchIconDark: {
    color:
      variant === 'homepage'
        ? theme.palette.common.white
        : theme.palette.common.black,
    margin: theme.spacing(1),
    width: 24,
    height: 24,
  },
}));

type ProfileSearchBarVariant = 'header' | 'homepage';

type ProfileSearchBarProps = {
  setWeb3Deps?: (value: Web3Dependencies | undefined) => void;
  variant?: ProfileSearchBarVariant;
};

const ProfileSearchBar: React.FC<ProfileSearchBarProps> = ({
  setWeb3Deps,
  variant = 'header',
}) => {
  const [t] = useTranslationContext();
  const [focus, setFocus] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchBarRef = useRef<HTMLDivElement | null>(null);
  const searchResultsRef = useRef<HTMLDivElement | null>(null);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const {classes} = useStyles({focus, variant});
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the clicked target is outside of the search bar and results
      if (
        searchBarRef.current &&
        searchResultsRef.current &&
        !searchBarRef.current.contains(event.target as Node) &&
        !searchResultsRef.current.contains(event.target as Node)
      ) {
        setFocus(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchResultsRef, searchBarRef]);

  const handleSearch = async (searchValue: string) => {
    if (!searchValue) {
      setSearchResults([]);
      return;
    }
    const domains = await searchProfiles(searchValue);
    setSearchResults(domains.slice(0, 5));
  };

  const handleClearText = () => {
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleSearchChange: React.ChangeEventHandler<
    HTMLInputElement
  > = event => {
    setSearchTerm(event.target.value);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      void handleSearch(event.target.value);
    }, 300);
  };

  const handleComponentOnFocus = () => {
    setFocus(true);
  };

  return (
    <Box
      className={classes.container}
      tabIndex={1}
      data-optimizely="profile-searchbar"
      ref={searchBarRef}
    >
      <InputBase
        id="search-input"
        fullWidth
        className={classes.inputBase}
        inputProps={{
          className: classes.input,
        }}
        type="search"
        value={searchTerm}
        placeholder={t('search.searchProfiles')}
        onChange={handleSearchChange}
        onFocus={handleComponentOnFocus}
        endAdornment={
          !searchTerm ? (
            <SearchIcon className={classes.searchIcon} />
          ) : (
            <div className={classes.searchRightBox}>
              <Tooltip placement="bottom" title={t('search.clear')}>
                <IconButton
                  data-testid="headerSearchBarClearButton"
                  onClick={handleClearText}
                  size="small"
                >
                  <CloseIcon className={classes.closeIcon} />
                </IconButton>
              </Tooltip>
              <div className={classes.searchIconContainer}>
                <SearchIcon className={classes.searchIconDark} />
              </div>
            </div>
          )
        }
      />

      {focus && searchTerm && searchResults.length ? (
        <div className={classes.searchResultsContainer} ref={searchResultsRef}>
          <Typography className={classes.searchResultsTitle}>
            {t('search.searchResultsFor', {searchTerm})}
          </Typography>
          {searchResults.map(domain => {
            const handleClick = () => {
              void router.push(`${config.UD_ME_BASE_URL}/${domain}`);
              setFocus(false);
            };
            return (
              <div className={classes.searchResult} onClick={handleClick}>
                <div className={classes.searchResultLeft}>
                  <DomainPreview
                    domain={domain}
                    size={40}
                    setWeb3Deps={setWeb3Deps}
                  />
                  <Typography className={classes.searchResultText}>
                    {domain}
                  </Typography>
                </div>
                <ChevronRightOutlinedIcon className={classes.rightIcon} />
              </div>
            );
          })}
        </div>
      ) : null}
    </Box>
  );
};

export default ProfileSearchBar;
