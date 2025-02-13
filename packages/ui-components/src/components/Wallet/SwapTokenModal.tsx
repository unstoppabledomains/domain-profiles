import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import {titleCase} from 'title-case';
import {useDebounce} from 'usehooks-ts';

import type {SwapConfig} from '@unstoppabledomains/config/build/src/env/types';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import type {TokenEntry} from '../../lib';
import {useTranslationContext} from '../../lib';
import type {SwapConfigToken} from '../../lib/types/swap';
import ManageInput from '../Manage/common/ManageInput';
import Token from './Token';

// infinite scroll page size
const PAGE_SIZE = 25;

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    justifyContent: 'space-between',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '400px',
    overflowY: 'auto',
    overscrollBehavior: 'contain',
  },
  searchContainer: {
    marginBottom: theme.spacing(1),
    width: '100%',
  },
  centered: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noTokensFound: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: theme.palette.wallet.text.primary,
  },
  clearIcon: {
    color: theme.palette.wallet.text.secondary,
    marginRight: theme.spacing(1),
  },
}));

export type SwapTokenModalMode = 'source' | 'destination';

type Props = {
  mode: SwapTokenModalMode;
  walletTokens: SwapConfigToken[];
  filterChain?: string;
  onSelectedToken: (mode: SwapTokenModalMode, token: SwapConfigToken) => void;
  getTokenEntry: (
    swapConfig: SwapConfig,
    placeholder?: boolean,
  ) => TokenEntry | undefined;
};

const SwapTokenModal: React.FC<Props> = ({
  mode,
  walletTokens,
  filterChain: initialFilterChain,
  onSelectedToken,
  getTokenEntry,
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const [aggregatedTokens, setAggregatedTokens] = useState<SwapConfigToken[]>(
    [],
  );
  const [searchTerm, setSearchTerm] = useState<string>();
  const [filterChain, setFilterChain] = useState(initialFilterChain);
  const searchTermDebounced = useDebounce(searchTerm, 250);

  // infinite scroll state
  const [hasMore, setHasMore] = useState(true);
  const [visibleItems, setVisibleItems] = useState(0);

  // filter the tokens based on the search term
  const filteredTokensWithSearch = aggregatedTokens.filter(
    v =>
      (!filterChain ||
        filterChain.toLowerCase() === v.swing.chain.toLowerCase()) &&
      (!searchTermDebounced ||
        [v.tokenSymbol, v.swing.symbol].find(matchingEntry =>
          matchingEntry
            .toLowerCase()
            .includes(searchTermDebounced.toLowerCase()),
        )),
  );

  useEffect(() => {
    setAggregatedTokens(
      walletTokens
        .filter(v => getTokenEntry(v, mode !== 'source'))
        .sort((a, b) => {
          return (
            (b.value || 0) - (a.value || 0) ||
            a.tokenSymbol.localeCompare(b.tokenSymbol)
          );
        }),
    );
  }, [walletTokens]);

  useEffect(() => {
    handleLoadMore();
  }, [aggregatedTokens]);

  const handleLoadMore = () => {
    if (visibleItems + PAGE_SIZE < filteredTokensWithSearch.length) {
      setVisibleItems(visibleItems + PAGE_SIZE);
      setHasMore(true);
    } else {
      setVisibleItems(filteredTokensWithSearch.length);
      setHasMore(false);
    }
  };

  const handleInputChange = (id: string, value: string) => {
    if (id === 'token-search') {
      setSearchTerm(value);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setVisibleItems(walletTokens.length);
    setHasMore(aggregatedTokens.length > walletTokens.length);
  };

  const renderMenuItem = (type: string, v: SwapConfigToken) => {
    const tokenEntry = getTokenEntry(v, true);
    if (!tokenEntry) {
      return null;
    }
    const key = `${mode}-${type}-${v.swing.chain}/${v.swing.symbol}`;
    return (
      <MenuItem
        key={`menu-item-${key}`}
        value={`${v.swing.chain}/${v.swing.symbol}`}
        disabled={!!v.disabledReason}
      >
        <Token
          key={`token-${key}`}
          token={tokenEntry}
          isOwner
          useVisibilitySensor={true}
          onClick={() => onSelectedToken(mode, v)}
        />
      </MenuItem>
    );
  };

  return (
    <Box className={classes.container}>
      <Box className={classes.searchContainer}>
        <ManageInput
          id="token-search"
          placeholder={
            filterChain
              ? t('swap.searchOnChain', {
                  chain: titleCase(filterChain),
                })
              : t('swap.search')
          }
          value={searchTerm}
          onChange={handleInputChange}
          endAdornment={
            searchTerm && (
              <IconButton
                className={classes.clearIcon}
                size="small"
                onClick={handleClearSearch}
              >
                <CloseIcon />
              </IconButton>
            )
          }
        />
        {initialFilterChain && (
          <Button
            variant="text"
            fullWidth
            size="small"
            onClick={() =>
              setFilterChain(filterChain ? undefined : initialFilterChain)
            }
          >
            {filterChain
              ? t('swap.showAllChains')
              : t('swap.showOnChain', {chain: titleCase(initialFilterChain)})}
          </Button>
        )}
      </Box>
      <Box className={classes.content} id="scrollableSwapTokenDiv">
        {filteredTokensWithSearch.length === 0 ? (
          <Box className={classes.noTokensFound}>
            <Typography>{t('swap.noTokensFound')}</Typography>
          </Box>
        ) : (
          <InfiniteScroll
            scrollableTarget={`scrollableSwapTokenDiv`}
            hasMore={hasMore}
            loader={<div />}
            next={handleLoadMore}
            dataLength={visibleItems}
            scrollThreshold={0.7}
          >
            {filteredTokensWithSearch.slice(0, visibleItems).map(v =>
              !v.disabledReason ? (
                renderMenuItem(mode, v)
              ) : (
                <Tooltip
                  arrow
                  placement="left"
                  title={v.disabledReason}
                  key={`sourceTooltip-${v.swing.chain}/${v.swing.symbol}`}
                >
                  <Box>{renderMenuItem(mode, v)}</Box>
                </Tooltip>
              ),
            )}
          </InfiniteScroll>
        )}
      </Box>
    </Box>
  );
};

export default SwapTokenModal;
