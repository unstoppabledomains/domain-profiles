import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import type {Theme} from '@mui/material/styles';
import React, {useState} from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import useAsyncEffect from 'use-async-effect';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {NFT_PAGE_SIZE, getWalletCollectionNfts} from '../../actions/nftActions';
import type {Nft, TokenEntry} from '../../lib';
import NftCard from '../TokenGallery/NftCard';
import {TitleWithBackButton} from './TitleWithBackButton';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    width: '100%',
  },
  cardContainer: {
    position: 'relative',
  },
  contentContainer: {
    marginTop: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: 'calc(100vh - 100px)',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  infinitescroll: {
    paddingRight: '1px',
    paddingLeft: '1px',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}));

type Props = {
  accessToken: string;
  collection: TokenEntry;
  onCancelClick: () => void;
};

const NftCollectionDetail: React.FC<Props> = ({collection, onCancelClick}) => {
  const {classes} = useStyles();
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string>();
  const [nfts, setNfts] = useState<Nft[]>([]);

  useAsyncEffect(async () => {
    await getNextPage();
  }, [collection]);

  const getNextPage = async () => {
    if (!collection?.address) {
      return;
    }
    const data = await getWalletCollectionNfts(
      collection.symbol,
      collection.walletAddress,
      collection.address,
      cursor,
    );
    if (data?.[collection.symbol]) {
      // normalize NFT data
      const newNfts = data[collection.symbol].nfts;
      newNfts.map(nft => (nft.symbol = collection.symbol));

      // set NFT data state
      setNfts([...nfts, ...newNfts]);
      setCursor(data[collection.symbol].cursor);
      setHasMore(newNfts.length < NFT_PAGE_SIZE);
    }
  };

  return (
    <Box className={classes.container}>
      <TitleWithBackButton
        onCancelClick={onCancelClick}
        label={collection.name}
      />
      <Box className={classes.contentContainer} id="collection-token-list">
        <InfiniteScroll
          className={classes.infinitescroll}
          hasMore={hasMore}
          next={getNextPage}
          dataLength={nfts.length}
          loader={<div></div>}
          scrollThreshold={0.7}
          scrollableTarget="collection-token-list"
        >
          <Grid container spacing={2}>
            {nfts.length > 0
              ? nfts.map((nft, index) => (
                  <Grid key={`nft-${index}`} item xs={6}>
                    <Box className={classes.cardContainer}>
                      <NftCard nft={nft} key={index} />
                    </Box>
                  </Grid>
                ))
              : [...new Array(4)].map((_, index) => (
                  <Grid key={`placeholder-${index}`} item xs={6}>
                    <Box className={classes.cardContainer}>
                      <NftCard
                        nft={{
                          link: '',
                          name: '',
                          description: '',
                          collection: '',
                          image_url: '',
                          mint: '',
                          video_url: '',
                          symbol: '',
                        }}
                        key={index}
                        placeholder={true}
                      />
                    </Box>
                  </Grid>
                ))}
          </Grid>
        </InfiniteScroll>
      </Box>
    </Box>
  );
};

export default NftCollectionDetail;
