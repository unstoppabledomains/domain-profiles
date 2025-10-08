import Grid from '@mui/material/Grid';
import type {Theme} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, {useEffect, useState} from 'react';
import SwiperCore, {Autoplay, Navigation} from 'swiper';
import {Swiper, SwiperSlide} from 'swiper/react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import type {Nft} from '../../lib';
import useTranslationContext from '../../lib/i18n';
import type {SerializedCryptoWalletBadge} from '../../lib/types/badge';
import type {SerializedNftMetadata} from '../../lib/types/nfts';
import NftCard from './NftCard';

const useStyles = makeStyles()((theme: Theme) => ({
  swiperContainer: {
    marginLeft: '-2px',
  },
  swiper: {
    paddingTop: theme.spacing(2),
    paddingLeft: '1px',
    paddingRight: '1px',
  },
  loadingContainer: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    marginRight: '-12px',
    display: 'flex',
    flexDirection: 'row',
  },
}));

interface Props {
  domain: string;
  address: string;
  nfts: Nft[];
  nftSymbolVisible: Record<string, boolean | undefined>;
  autoPlay?: boolean;
  showPlaceholder?: boolean;
  minNftCount?: number;
  maxNftCount?: number;
  badgeData?: SerializedCryptoWalletBadge;
}

const NFTGalleryCarousel = ({
  domain,
  address,
  nfts,
  nftSymbolVisible,
  showPlaceholder,
  minNftCount = 2,
  maxNftCount = 3,
  autoPlay = true,
  badgeData,
}: Props) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const [placeholders, setPlaceholders] = useState<SerializedNftMetadata[]>([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const loadingCount = isMobile ? minNftCount : maxNftCount;
  const placeholderCount = showPlaceholder
    ? Math.max(loadingCount - nfts.length, 0)
    : 0;

  // determine the visible NFTs and placeholder lists
  const visibleNfts = nfts.filter(
    nft => nftSymbolVisible[nft.symbol || ''] && nft.verified && nft.public,
  );
  const visiblePlaceholders = placeholders.slice(0, placeholderCount);

  // sort the listings on a page load effect, so it only happens a single time
  // and removes flicker when this operations is performed directly
  useEffect(() => {
    setPlaceholders(
      badgeData?.marketplace?.listings?.sort(() => Math.random() - 0.5) || [],
    );
  }, []);

  const swiperCss = `
   .swiper-button-next::after, .swiper-button-prev::after {
     font-size: var(--swiper-navigation-small);
   }

 .swiper-button-prev, .swiper-button-next {
     box-sizing: border-box;
     width: 32px;
     height: 32px;
     background: rgba(255, 255, 255, 0.8);

     border: 1px solid #DDDDDF;
     backdrop-filter: blur(2px);

     border-radius: 50%;
  }

 .swiper-wrapper {
  padding-bottom: 1rem;
 }
  `;

  SwiperCore.use([Autoplay, Navigation]);

  return (
    <div className={classes.swiperContainer}>
      {placeholderCount > 0 || visibleNfts.length > 0 ? (
        <>
          <style>{swiperCss}</style>
          <Swiper
            data-testid={'nft-gallery-carousel'}
            slidesPerGroup={1}
            loop={visibleNfts.length > maxNftCount}
            loopFillGroupWithBlank={false}
            pagination={false}
            navigation={visibleNfts.length > maxNftCount}
            className={classes.swiper}
            autoplay={
              autoPlay
                ? {
                    delay: 5000,
                    disableOnInteraction: true,
                    pauseOnMouseEnter: true,
                  }
                : undefined
            }
            breakpoints={{
              0: {
                slidesPerView: minNftCount,
                spaceBetween: 16,
              },
              320: {
                slidesPerView: minNftCount,
                spaceBetween: 16,
              },
              // when window width is >= 600px
              600: {
                slidesPerView: minNftCount,
                spaceBetween: 16,
              },
              // when window width is >= 640px
              768: {
                slidesPerView: maxNftCount,
                spaceBetween: 16,
              },
            }}
          >
            <>
              {visibleNfts.map((nft, index) => (
                <SwiperSlide
                  key={`${index}-slide`}
                  data-testid={`nft-carousel-item-${index}`}
                >
                  <NftCard
                    nft={nft}
                    key={`${index}-card`}
                    domain={domain}
                    address={address}
                    compact={true}
                  />
                </SwiperSlide>
              ))}
              {visiblePlaceholders.map(
                (placeholder, index) =>
                  badgeData && (
                    <SwiperSlide key={`placeholder-${index}}`}>
                      <NftCard
                        compact={true}
                        nft={{
                          link: placeholder.link || badgeData.linkUrl || '',
                          collection: placeholder.floorPrice
                            ? t('nftCollection.addToCollection', {
                                value: parseFloat(
                                  placeholders[index].floorPrice!.value.toFixed(
                                    4,
                                  ),
                                ),
                                currency:
                                  placeholders[index].floorPrice!.currency,
                              })
                            : placeholder.name || badgeData.name,
                          name: placeholder.floorPrice
                            ? t('cards.available')
                            : t('apps.featured'),
                          description: badgeData.description,
                          image_url: placeholder.image_url || badgeData.logo,
                          mint: placeholder.mint,
                          symbol: '',
                          video_url: '',
                        }}
                        domain={domain}
                        address={address}
                        placeholder={true}
                      />
                    </SwiperSlide>
                  ),
              )}
            </>
          </Swiper>
        </>
      ) : (
        <Grid
          container
          data-testid={'nft-carousel-loader'}
          className={classes.loadingContainer}
          spacing={2}
        >
          {[...new Array(loadingCount)].map((_, key) => (
            <Grid key={key} item xs={12 / minNftCount} md={12 / maxNftCount}>
              <NftCard
                compact={true}
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
                domain={domain}
                address={address}
                placeholder={true}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  );
};

export default NFTGalleryCarousel;
