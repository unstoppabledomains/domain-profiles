/* eslint-disable @typescript-eslint/no-explicit-any */
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useRef, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import useTranslationContext from '../../../lib/i18n';
import {TabType} from '../types';

const useStyles = makeStyles<{searchFocus: boolean}>()(
  (theme: Theme, {searchFocus}) => ({
    searchContainer: {
      display: 'flex',
      margin: theme.spacing(0),
      width: '100%',
    },
    searchBase: {
      border: `1px solid ${
        searchFocus
          ? theme.palette.neutralShades[500]
          : theme.palette.neutralShades[100]
      }`,
      borderRadius: theme.shape.borderRadius,
      paddingLeft: 12,
      backgroundColor: theme.palette.neutralShades[100],
    },
    searchInput: {
      fontSize: 16,
      color: theme.palette.neutralShades[500],
      '&::-webkit-search-cancel-button': {
        WebkitAppearance: 'none',
      },
      '&::placeholder': {color: theme.palette.neutralShades[500], opacity: 1},
      '&::-webkit-input-placeholder': {
        color: theme.palette.neutralShades[400],
        opacity: 1,
      },
    },
    searchIcon: {
      color: theme.palette.neutralShades[500],
      margin: theme.spacing(1),
      width: 24,
      height: 24,
    },
  }),
);

export type SearchProps = {
  handleSearch: (searchTerm: string) => void;
  initialValue?: string;
  tab: TabType;
};

export const Search: React.FC<SearchProps> = ({
  handleSearch,
  initialValue,
  tab,
}) => {
  const [t] = useTranslationContext();
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [searchFocus, setSearchFocus] = useState(false);
  const searchBarRef = useRef<HTMLDivElement | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {classes} = useStyles({searchFocus});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the clicked target is outside of the search bar and results
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node)
      ) {
        setSearchFocus(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchBarRef]);

  useEffect(() => {
    setSearchTerm(initialValue);
    handleSearch(initialValue || '');
  }, [tab]);

  const handleSearchChange: React.ChangeEventHandler<
    HTMLInputElement
  > = event => {
    setSearchTerm(event.target.value);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      handleSearch(event.target.value);
    }, 300);
  };

  return (
    <Box className={classes.searchContainer} ref={searchBarRef}>
      <InputBase
        id="search-input"
        fullWidth
        className={classes.searchBase}
        inputRef={input => input?.focus()}
        inputProps={{
          className: classes.searchInput,
        }}
        type="search"
        autoComplete="off"
        autoCorrect="off"
        value={searchTerm}
        placeholder={
          tab === TabType.Chat
            ? t('push.searchChat')
            : tab === TabType.Communities
            ? t('push.searchCommunities')
            : t('push.searchNotification')
        }
        onChange={handleSearchChange}
        onFocus={() => setSearchFocus(true)}
        endAdornment={<SearchIcon className={classes.searchIcon} />}
      />
    </Box>
  );
};

export default Search;
