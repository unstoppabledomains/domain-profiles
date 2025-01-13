import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {alpha} from '@mui/system/colorManipulator';
import React, {useEffect, useRef, useState} from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {searchProfiles} from '../../actions/domainProfileActions';
import {DomainPreview} from '../../components/Domain/DomainPreview';
import type {SerializedProfileSearch} from '../../lib';
import {convertCentToUsdString} from '../../lib';
import useTranslationContext from '../../lib/i18n';
import type {Web3Dependencies} from '../../lib/types/web3';

const useStyles = makeStyles<{
  focus: boolean;
  variant: ProfileSearchBarVariant;
}>()((theme: Theme, {focus, variant}) => ({
  container: {
    position: 'relative',
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
      variant === 'homepage'
        ? theme.palette.background.paper
        : alpha(theme.palette.background.paper, 0.2),
    boxShadow: variant === 'homepage' ? theme.shadows[6] : undefined,
  },
  input: {
    fontSize: variant === 'homepage' ? 20 : 16,
    color:
      variant === 'homepage'
        ? focus
          ? theme.palette.common.black
          : theme.palette.neutralShades[400]
        : theme.palette.background.paper,
    '&::-webkit-search-cancel-button': {
      WebkitAppearance: 'none',
    },
    '&::placeholder': {
      color:
        variant === 'homepage'
          ? theme.palette.neutralShades[400]
          : theme.palette.background.paper,
      opacity: 1,
    },
    '&::-webkit-input-placeholder': {
      color:
        variant === 'homepage'
          ? theme.palette.neutralShades[400]
          : theme.palette.background.paper,
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
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.neutralShades[100]}`,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 10,
    position: 'absolute',
    marginTop: variant === 'homepage' ? theme.spacing(9) : theme.spacing(6),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    maxHeight: '270px',
    overflow: 'auto',
  },
  searchResultsTitle: {
    paddingLeft: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    paddingTop: theme.spacing(1),
  },
  searchResult: {
    padding: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.neutralShades[50],
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
    whiteSpace: 'nowrap',
  },
  noSearchResultText: {
    maxWidth: 'calc(100% - 60px)',
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  searchResultLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  closeIcon: {
    color:
      variant === 'homepage'
        ? theme.palette.neutralShades[400]
        : theme.palette.background.paper,
    height: '16px',
    width: '16px',
  },
  searchIcon: {
    color:
      variant === 'homepage'
        ? theme.palette.background.paper
        : focus
        ? theme.palette.getContrastText(theme.palette.background.paper)
        : theme.palette.background.paper,
    margin: theme.spacing(1),
    width: 24,
    height: 24,
  },
  loadingIcon: {
    color:
      variant === 'homepage'
        ? theme.palette.background.paper
        : focus
        ? theme.palette.getContrastText(theme.palette.background.paper)
        : theme.palette.background.paper,
    padding: theme.spacing(1),
  },
  rightIcon: {
    color: theme.palette.neutralShades[400],
  },
  adornmentContainer: {
    display: 'flex',
    height: '100%',
    alignItems: 'center',
  },
  searchCartIcon: {
    width: '45px',
    height: '45px',
    padding: theme.spacing(0.5),
  },
  searchIconContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor:
      variant === 'homepage'
        ? theme.palette.primary.main
        : focus
        ? theme.palette.background.paper
        : undefined,
    height: '100%',
    borderRadius: '0px 7px 7px 0px',
    cursor: 'pointer',
    width: variant === 'homepage' ? '60px' : '40px',
    marginLeft: theme.spacing(1),
    justifyContent: 'center',
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
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchBarRef = useRef<HTMLDivElement | null>(null);
  const searchResultsRef = useRef<HTMLDivElement | null>(null);
  const [searchResults, setSearchResults] = useState<SerializedProfileSearch[]>(
    [],
  );
  const {classes} = useStyles({focus, variant});

  const isMatchingSearchResults =
    searchResults.filter(v => !v.market).length > 0;
  const isAvailableSearchResults =
    searchResults.filter(v => v.market?.price).length > 0;
  const showMatchingResultCount = 5;
  const showAvailableResultCount = isMatchingSearchResults
    ? 1
    : showMatchingResultCount;

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
    setIsSearching(true);
    const domains = await searchProfiles(searchValue);
    setIsSearching(false);
    setSearchResults(domains);
  };

  const handleSearchIconClicked = () => {
    if (searchTerm) {
      window.location.href = `${config.UNSTOPPABLE_WEBSITE_URL}/search?searchTerm=${searchTerm}&searchRef=udMe&tab=relevant`;
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEnter = (e: any) => {
    if (e.key === 'Enter' && isMatchingSearchResults) {
      // navigate to the first matching entry
      const firstResultLink = searchResults
        .filter(v => !v.market)
        .sort((a, b) => a.name.length - b.name.length)[0].linkUrl;
      window.location.href = firstResultLink;
    }
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

  const renderSearchResults = (results: SerializedProfileSearch[]) =>
    results
      .sort((a, b) => a.name.length - b.name.length)
      .map(searchResult => {
        const handleClick = () => {
          window.location.href = searchResult.linkUrl;
          setFocus(false);
        };
        return (
          <Box className={classes.searchResult} onClick={handleClick}>
            {searchResult.market ? (
              <Box className={classes.searchResultLeft}>
                <ShoppingCartOutlinedIcon
                  className={classes.searchCartIcon}
                  color="primary"
                />
                <Typography
                  variant="body2"
                  className={classes.searchResultText}
                >
                  {searchResult.name} (
                  {convertCentToUsdString(searchResult.market.price)})
                </Typography>
              </Box>
            ) : (
              <Box className={classes.searchResultLeft}>
                <DomainPreview
                  domain={searchResult.name}
                  size={40}
                  setWeb3Deps={setWeb3Deps}
                />
                <Typography
                  variant="body2"
                  className={classes.searchResultText}
                >
                  {searchResult.name}
                </Typography>
              </Box>
            )}
            <ChevronRightOutlinedIcon className={classes.rightIcon} />
          </Box>
        );
      });

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
        onKeyDown={handleEnter}
        endAdornment={
          <Box className={classes.adornmentContainer}>
            {searchTerm && (
              <Tooltip placement="bottom" title={t('search.clear')}>
                <IconButton
                  data-testid="headerSearchBarClearButton"
                  onClick={handleClearText}
                  size="small"
                >
                  <CloseIcon className={classes.closeIcon} />
                </IconButton>
              </Tooltip>
            )}
            <Box
              className={classes.searchIconContainer}
              onClick={handleSearchIconClicked}
            >
              {isSearching ? (
                <CircularProgress className={classes.loadingIcon} />
              ) : (
                <SearchIcon className={classes.searchIcon} />
              )}
            </Box>
          </Box>
        }
      />
      {focus && searchTerm && searchResults.length ? (
        <Box className={classes.searchResultsContainer} ref={searchResultsRef}>
          {isMatchingSearchResults ? (
            <>
              <Typography variant="h6" className={classes.searchResultsTitle}>
                {t('search.searchResultsFor', {searchTerm})}
              </Typography>
              {renderSearchResults(
                searchResults
                  .filter(v => !v.market)
                  .slice(0, showMatchingResultCount),
              )}
            </>
          ) : (
            <>
              <Typography variant="h6" className={classes.searchResultsTitle}>
                {t('search.noSearchResultsFor', {searchTerm})}
              </Typography>
              <Typography
                variant="body2"
                className={classes.noSearchResultText}
              >
                {t('search.tryAnotherSearch')}{' '}
                {isAvailableSearchResults && t('search.orTryPurchase')}
              </Typography>
            </>
          )}
          {isAvailableSearchResults && (
            <>
              <Typography variant="h6" className={classes.searchResultsTitle}>
                {t('search.availableDomainsFor', {searchTerm})}
              </Typography>
              {renderSearchResults(
                searchResults
                  .filter(v => v.market?.price)
                  .slice(0, showAvailableResultCount),
              )}
            </>
          )}
        </Box>
      ) : null}
    </Box>
  );
};

export default ProfileSearchBar;
