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

const useStyles = makeStyles<{focus: boolean}>()((theme: Theme, {focus}) => ({
  container: {
    display: 'flex',
    width: '100%',
    height: '40px',
  },
  inputBase: {
    border: `1px solid ${
      focus ? 'rgba(255, 255, 255, 0.50)' : 'rgba(255, 255, 255, 0.10)'
    }`,
    borderRadius: theme.shape.borderRadius,
    paddingLeft: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
  },
  input: {
    fontSize: 16,
    color: theme.palette.common.white,
    '&::-webkit-search-cancel-button': {
      WebkitAppearance: 'none',
    },
    '&::placeholder': {color: theme.palette.common.white, opacity: 1},
    '&::-webkit-input-placeholder': {
      color: theme.palette.common.white,
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
    width: '512px',
    backgroundColor: theme.palette.white,
    border: `1px solid ${theme.palette.neutralShades[100]}`,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 10,
    position: 'absolute',
    marginTop: theme.spacing(6),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      width: '350px',
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
    color: '#FFFFFF80',
    height: '16px',
    width: '16px',
  },
  searchIcon: {
    color: theme.palette.common.white,
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
    backgroundColor: 'white',
    height: '100%',
    borderRadius: '0px 7px 7px 0px',
  },
  searchIconDark: {
    color: theme.palette.common.black,
    margin: theme.spacing(1),
    width: 24,
    height: 24,
  },
}));

type ProfileSearchBarProps = {
  setWeb3Deps?: (value: Web3Dependencies | undefined) => void;
};

const ProfileSearchBar: React.FC<ProfileSearchBarProps> = ({setWeb3Deps}) => {
  const [t] = useTranslationContext();
  const [focus, setFocus] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchBarRef = useRef<HTMLDivElement | null>(null);
  const searchResultsRef = useRef<HTMLDivElement | null>(null);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const {classes} = useStyles({focus});
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
