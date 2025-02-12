import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import useAsyncEffect from 'use-async-effect';
import {useDebounce} from 'usehooks-ts';

import type {SwapConfig} from '@unstoppabledomains/config/build/src/env/types';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getSwapTokens} from '../../actions/swapActions';
import type {TokenEntry} from '../../lib';
import {useTranslationContext} from '../../lib';
import ManageInput from '../Manage/common/ManageInput';
import {getBlockchainSymbol} from '../Manage/common/verification/types';
import Token from './Token';

// infinite scroll page size
const PAGE_SIZE = 25;

// internal type used to define a swap pair
export type SwapToken = SwapConfig & {
  balance?: number;
  value?: number;
  walletAddress: string;
};

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
  availableTokens: SwapToken[];
  onSelectedToken: (mode: SwapTokenModalMode, token: SwapToken) => void;
  getTokenEntry: (
    swapConfig: SwapConfig,
    placeholder?: boolean,
  ) => TokenEntry | undefined;
};

const SwapTokenModal: React.FC<Props> = ({
  mode,
  availableTokens,
  onSelectedToken,
  getTokenEntry,
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const [walletTokens, setWalletTokens] = useState<SwapToken[]>([]);
  const [aggregatedTokens, setAggregatedTokens] = useState<SwapToken[]>([]);
  const [dynamicTokens, setDynamicTokens] = useState<SwapToken[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>();
  const searchTermDebounced = useDebounce(searchTerm, 250);

  // infinite scroll state
  const [hasMore, setHasMore] = useState(true);
  const [visibleItems, setVisibleItems] = useState(0);

  // filter the tokens based on the search term
  const filteredTokensWithSearch = aggregatedTokens.filter(
    v =>
      !searchTermDebounced ||
      [v.tokenSymbol, v.swing.symbol].find(matchingEntry =>
        matchingEntry.toLowerCase().includes(searchTermDebounced.toLowerCase()),
      ),
  );

  useAsyncEffect(async () => {
    // set wallet tokens on page load
    setWalletTokens(availableTokens);

    // no more work to do if we are in source mode
    if (mode === 'source') {
      return;
    }

    // retrieve all available tokens
    const allTokens = await getSwapTokens();

    const newTokens: SwapToken[] = [];
    allTokens.map(token => {
      // check if the token is already in the walletTokens array
      const existingToken = availableTokens.find(
        v =>
          v.swing.chain.toLowerCase() === token.chain.toLowerCase() &&
          v.swing.symbol.toLowerCase() === token.symbol.toLowerCase(),
      );
      if (existingToken) {
        return;
      }

      // add the token to the dynamicTokens array
      const walletType = getBlockchainSymbol(token.chain);
      newTokens.push({
        swing: {
          chain: token.chain,
          symbol: token.address,
          type: token.chain === 'solana' ? 'spl' : 'erc20',
        },
        walletAddress:
          availableTokens.find(v => v.walletType === walletType)
            ?.walletAddress || '',
        chainName: token.chain,
        chainSymbol: walletType,
        tokenSymbol: token.symbol,
        imageUrl: token.logo,
        walletType,
      });
    });

    // render the new tokens
    setDynamicTokens(newTokens);
  }, []);

  useEffect(() => {
    setAggregatedTokens(
      [...walletTokens, ...dynamicTokens].filter(v =>
        getTokenEntry(v, mode !== 'source'),
      ),
    );
  }, [walletTokens, dynamicTokens]);

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
    setVisibleItems(availableTokens.length);
    setHasMore(aggregatedTokens.length > availableTokens.length);
  };

  const renderMenuItem = (type: string, v: SwapToken) => {
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
          placeholder={t('swap.search')}
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
