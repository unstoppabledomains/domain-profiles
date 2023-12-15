import Clear from '@mui/icons-material/Clear';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import type {Nft} from '../../lib';
import useTranslationContext from '../../lib/i18n';
import NftCard from './NftCard';
import NftFilterSelect from './NftFilterSelect';
import {NftTag} from './NftGalleryData';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    marginLeft: '-2px',
  },
  cardContainer: {
    position: 'relative',
  },
  infinitescroll: {
    paddingRight: '1px',
    paddingLeft: '1px',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  filterContainer: {
    border: '1px solid #DDDDDF',
    borderRadius: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginTop: theme.spacing(0),
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
    alignItems: 'center',
  },
  filterChipContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    marginTop: theme.spacing(0),
    marginBottom: theme.spacing(1),
    alignItems: 'center',
  },
  filterListContainer: {
    display: 'flex',
    flexWrap: 'nowrap',
    verticalAlign: 'center',
    alignItems: 'center',
  },
  filterChip: {
    textTransform: 'capitalize',
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    cursor: 'pointer',
    backgroundColor: '#fff',
    fontWeight: 'bold',
    color: theme.palette.neutralShades[500],
    border: `1px solid ${theme.palette.neutralShades[500]}`,
  },
  filterClearButton: {
    alignItems: 'flex-start',
  },
}));

enum FilterType {
  Chain = 'chain',
  Category = 'category',
  Collection = 'collection',
}

interface Props {
  domain: string;
  isOwner: boolean;
  nfts: Nft[];
  nftSymbolVisible: Record<string, boolean | undefined>;
  isAllNftsLoaded: boolean;
  setTokenCount: (arg0: number) => void;
}

const NftGalleryView = ({
  domain,
  nfts: allNfts,
  nftSymbolVisible,
  isOwner,
  isAllNftsLoaded,
  setTokenCount,
}: Props) => {
  // state management
  const imagesPerPage = 10;
  const {classes} = useStyles();
  const [nfts, setNfts] = useState(allNfts);
  const [lastNftIndex, setLastNftIndex] = useState(imagesPerPage);
  const [t] = useTranslationContext();

  // filter management
  const defaultVisibility = {
    [FilterType.Category]: {
      [NftTag.All]: true,
    },
    [FilterType.Chain]: {
      [NftTag.All]: true,
    },
    [FilterType.Collection]: {
      [NftTag.All]: true,
    },
  };
  const [visibleTags, setVisibleTags] =
    useState<Record<FilterType, Record<string, boolean>>>(defaultVisibility);
  const [selectedSymbol, setSelectedSymbol] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string[]>([]);

  useEffect(() => {
    setVisibility(FilterType.Chain, selectedSymbol);
  }, [selectedSymbol]);

  useEffect(() => {
    setVisibility(FilterType.Category, selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    setVisibility(FilterType.Collection, selectedCollection);
  }, [selectedCollection]);

  useEffect(() => {
    // update set of visible NFTs based on currently active filter
    const visibleNfts = allNfts
      // remove unverified data
      .filter(
        nft => isSymbolVerified(nft.symbol || '') && (isOwner || nft.public),
      )

      // remove data with hidden tag for non owner
      .filter(nft => {
        const isNftHidden = nft.tags?.includes(NftTag.Hidden);
        return (
          // render hidden NFTs for owner
          isOwner ||
          // do not render hidden NFTs for non-owner
          !isNftHidden
        );
      })

      // remove data based on selected filters
      .filter(nft => {
        let nftVisible = true;
        for (const filterType of [
          FilterType.Chain,
          FilterType.Category,
          FilterType.Collection,
        ]) {
          let filterTypeMatch =
            Object.keys(visibleTags[filterType]).length === 0 ||
            visibleTags[filterType][NftTag.All];
          for (const tag of Object.keys(visibleTags[filterType])) {
            if (nft.tags?.includes(tag)) {
              filterTypeMatch = visibleTags[filterType][tag] === true;
            }
            if (
              filterType === FilterType.Collection &&
              nft.collection === tag
            ) {
              filterTypeMatch = visibleTags[filterType][tag] === true;
            }
          }
          nftVisible = nftVisible && filterTypeMatch;
        }
        return nftVisible;
      });

    // set the final state of visible NFT data
    setNfts(visibleNfts);
    setTokenCount(visibleNfts.length);
    setLastNftIndex(imagesPerPage);
  }, [allNfts, visibleTags]);

  const setVisibility = (filterType: FilterType, items: string[]) => {
    const newTags: Record<string, boolean> = {};
    items.forEach(tag => (newTags[tag] = true));
    if (Object.keys(newTags).length === 0) {
      newTags[NftTag.All] = true;
    }
    setVisibleTags({
      ...visibleTags,
      [filterType]: newTags,
    });
  };

  const handleSymbolChange = async (symbol: string) => {
    if (symbol === NftTag.All) {
      setSelectedSymbol([]);
      return;
    }
    if (selectedSymbol.includes(symbol)) {
      setSelectedSymbol([
        ...selectedSymbol.filter(existing => existing !== symbol),
      ]);
    } else {
      setSelectedSymbol([...selectedSymbol, symbol]);
    }
  };

  const handleCategoryChange = async (category: string) => {
    if (category === NftTag.All) {
      setSelectedCategory([]);
      return;
    }
    if (selectedCategory.includes(category)) {
      setSelectedCategory([
        ...selectedCategory.filter(existing => existing !== category),
      ]);
    } else {
      setSelectedCategory([...selectedCategory, category]);
    }
  };

  const handleCollectionChange = async (collection: string) => {
    if (collection === NftTag.All) {
      setSelectedCollection([]);
      return;
    }
    if (selectedCollection.includes(collection)) {
      setSelectedCollection([
        ...selectedCollection.filter(existing => existing !== collection),
      ]);
    } else {
      setSelectedCollection([...selectedCollection, collection]);
    }
  };

  const handleChipClick = (filterType: FilterType, tag: string) => {
    switch (filterType) {
      case FilterType.Category:
        setSelectedCategory([
          ...selectedCategory.filter(existing => existing !== tag),
        ]);
        break;
      case FilterType.Collection:
        setSelectedCollection([
          ...selectedCollection.filter(existing => existing !== tag),
        ]);
        break;
      case FilterType.Chain:
        setSelectedSymbol([
          ...selectedSymbol.filter(existing => existing !== tag),
        ]);
        break;
    }
  };

  const handleClearClick = () => {
    setSelectedSymbol([]);
    setSelectedCategory([]);
    setSelectedCollection([]);
    setVisibleTags(defaultVisibility);
  };

  const isSymbolVerified = (symbol: string): boolean => {
    return (
      allNfts.filter(nft => nft.symbol === symbol && nft.verified).length > 0
    );
  };

  const getFilterOption = (
    name: string,
    tag: NftTag,
  ): {value: string; label: string} => {
    // count items belonging to filter
    const tagItemCount = allNfts
      .filter(nft => nft.tags?.includes(tag))
      .filter(nft => {
        const isNftHidden = nft.tags?.includes(NftTag.Hidden);
        return !isNftHidden || (isNftHidden && tag === NftTag.Hidden);
      }).length;

    // do not show empty tags
    if (!tagItemCount) {
      return {value: '', label: ''};
    }

    // only show hidden tag to owner
    if (tag === NftTag.Hidden && !isOwner) {
      return {value: '', label: ''};
    }

    return {value: tag, label: `${name} (${tagItemCount})`};
  };

  return (
    <div
      className={classes.container}
      data-testid={`nftGallery-infinite-scroll`}
    >
      {allNfts.length === 0 ? (
        <Box display="flex" justifyContent="center" padding={3}>
          <CircularProgress color="secondary" />
        </Box>
      ) : (
        allNfts.length > 0 && (
          <div>
            <div className={classes.filterContainer}>
              <div className={classes.filterListContainer}>
                {Object.keys(nftSymbolVisible).filter(symbol =>
                  isSymbolVerified(symbol),
                ).length > 1 && (
                  <NftFilterSelect
                    id={'nftGallery-filter-symbol'}
                    onChange={handleSymbolChange}
                    title={t('nftCollection.filterByChain')}
                    disabled={false}
                    selected={selectedSymbol}
                    options={[
                      getFilterOption('All Chains', NftTag.All),
                      ...Object.keys(nftSymbolVisible)
                        .sort()
                        .filter(symbol => isSymbolVerified(symbol))
                        .map(symbol => {
                          return getFilterOption(symbol, symbol as NftTag);
                        }),
                    ]}
                  />
                )}
                <NftFilterSelect
                  id={'nftGallery-filter-tag'}
                  onChange={handleCategoryChange}
                  title={t('nftCollection.filterByCategory')}
                  disabled={false}
                  selected={selectedCategory}
                  options={[
                    getFilterOption('All Visible', NftTag.All),
                    getFilterOption('Awards', NftTag.Award),
                    getFilterOption('DAO Voting', NftTag.DAO),
                    getFilterOption('Deeds', NftTag.Deed),
                    getFilterOption('Developer', NftTag.Developer),
                    getFilterOption('Web3 Domains', NftTag.Domain),
                    getFilterOption('Education', NftTag.Education),
                    getFilterOption('Gaming', NftTag.Gaming),
                    getFilterOption('Tickets', NftTag.Ticket),
                    getFilterOption('Sustainability', NftTag.Sustainability),
                    getFilterOption('Wearables', NftTag.Wearable),
                    getFilterOption('Hidden', NftTag.Hidden),
                  ]}
                />
                <NftFilterSelect
                  id={'nftGallery-filter-collection'}
                  onChange={handleCollectionChange}
                  title={t('nftCollection.filterByCollection')}
                  disabled={false}
                  selected={selectedCollection}
                  options={[
                    getFilterOption('All Collections', NftTag.All),
                    ...[
                      ...new Set([
                        ...allNfts
                          .filter(nft => nft.collection && nft.mint)
                          .map(nft => nft.collection),
                      ]),
                    ]
                      .sort((a, b) => a.localeCompare(b))
                      .map(collection => {
                        return {
                          label: `${collection} (${
                            allNfts.filter(nft => nft.collection === collection)
                              .length
                          })`,
                          value: collection,
                        };
                      }),
                  ]}
                />
              </div>
              <div className={classes.filterListContainer}>
                {!isAllNftsLoaded && (
                  <Tooltip title={t('nftCollection.loading')}>
                    <CircularProgress
                      sx={{marginLeft: '5px', marginRight: '10px'}}
                      size="1.5rem"
                    />
                  </Tooltip>
                )}
              </div>
            </div>
            <div className={classes.filterChipContainer}>
              <div>
                {Object.keys(visibleTags).map(filterType => {
                  return Object.keys(visibleTags[filterType])
                    .filter(
                      tag => tag !== NftTag.All && visibleTags[filterType][tag],
                    )
                    .map(tag => {
                      return (
                        <Chip
                          key={tag}
                          label={
                            <div className={classes.filterListContainer}>
                              {tag}
                              <Clear
                                sx={{
                                  marginLeft: '5px',
                                  width: '15px',
                                  height: '15px',
                                }}
                              />
                            </div>
                          }
                          onClick={() =>
                            handleChipClick(filterType as FilterType, tag)
                          }
                          className={classes.filterChip}
                        />
                      );
                    });
                })}
                {(selectedSymbol.length > 0 ||
                  selectedCategory.length > 0 ||
                  selectedCollection.length > 0) && (
                  <Button
                    sx={{color: 'gray'}}
                    size="small"
                    onClick={handleClearClick}
                    data-testid={`nftGallery-filter-clear`}
                    className={classes.filterClearButton}
                  >
                    {t('apps.clearAll')}
                  </Button>
                )}
              </div>
            </div>
            <InfiniteScroll
              className={classes.infinitescroll}
              hasMore={lastNftIndex < nfts.length}
              next={() => setLastNftIndex(lastNftIndex + imagesPerPage)}
              dataLength={lastNftIndex}
              loader={<div></div>}
              scrollThreshold={0.7}
            >
              <Grid container spacing={2}>
                {nfts
                  .slice(
                    0,
                    lastNftIndex < nfts.length ? lastNftIndex : nfts.length,
                  )
                  .map((nft, index) => (
                    <Grid key={index} item xs={6} sm={4} md={4}>
                      <Box className={classes.cardContainer}>
                        <NftCard nft={nft} domain={domain} key={index} />
                      </Box>
                    </Grid>
                  ))}
              </Grid>
            </InfiniteScroll>
          </div>
        )
      )}
    </div>
  );
};

export default NftGalleryView;
