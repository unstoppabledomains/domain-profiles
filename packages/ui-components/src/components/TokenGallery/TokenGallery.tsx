import AutoAwesome from '@mui/icons-material/AutoAwesome';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import NFTGalleryCarousel from '../../components/TokenGallery/NFTGalleryCarousel';
import NftFirstTimeGalleryContainer from '../../components/TokenGallery/NftFirstTimeGalleryContainer';
import {getNextNftPageFn} from '../../components/TokenGallery/NftGalleryData';
import {NftGalleryManager} from '../../components/TokenGallery/NftGalleryManager';
import NftGalleryView from '../../components/TokenGallery/NftGalleryView';
import useTokenGallery from '../../hooks/useTokenGallery';
import useWeb3Context from '../../hooks/useWeb3Context';
import type {NftMintItem, NftResponse} from '../../lib';
import useTranslationContext from '../../lib/i18n';

export interface TokenGalleryProps {
  domain: string;
  enabled?: boolean;
  isOwner?: boolean;
  ownerAddress: string;
  profileServiceUrl: string;
  hideConfigureButton?: boolean;
}

export const useStyles = makeStyles()((theme: Theme) => ({
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    verticalAlign: 'center',
    textAlign: 'center',
    paddingBottom: theme.spacing(1),
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.h5.fontSize,
    margin: theme.spacing(6, 0, 1),
    lineHeight: 1.4,
  },
  nftGalleryConfigureButton: {
    padding: theme.spacing(1),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  nftGalleryHeader: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nftEmptyGallery: {
    marginBottom: '1.5rem',
  },
  tokenCount: {
    minWidth: '30px',
    minHeight: '10px',
    padding: '0px 5px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '20px',
    backgroundColor: theme.palette.primaryShades[200],
    color: theme.palette.primary.main,
    fontSize: theme.typography.h5.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    marginLeft: '10px',
  },
  nftGalleryLinks: {
    display: 'flex',
    justifyContent: 'right',
    verticalAlign: 'center',
    fontSize: theme.typography.body2.fontSize,
  },
  nftShowAll: {
    color: theme.palette.primary.main,
    fontSize: theme.typography.body2.fontSize,
    lineHeight: 1.5,
    fontWeight: theme.typography.fontWeightMedium,
    transition: theme.transitions.create('color'),
    '&:hover': {
      textDecoration: 'none',
      color: theme.palette.primary.main,
    },
    cursor: 'pointer',
  },
}));

const TokenGallery: React.FC<TokenGalleryProps> = ({
  domain,
  enabled,
  isOwner,
  ownerAddress,
  profileServiceUrl,
  hideConfigureButton,
}: TokenGalleryProps) => {
  const {classes, cx} = useStyles();
  const {setWeb3Deps} = useWeb3Context();
  const {
    expanded,
    setExpanded,
    nfts,
    setNfts,
    nftSymbolVisible,
    setNftSymbolVisible,
  } = useTokenGallery();
  const [t] = useTranslationContext();
  const [nftAddressRecords, setNftAddressRecords] =
    useState<Record<string, NftResponse>>();
  const [hasNfts, setHasNfts] = useState<boolean | undefined>(false);
  const [nftDataLoading, setNftDataLoading] = useState<boolean>(true);
  const [itemsToUpdate, setItemsToUpdate] = useState<NftMintItem[]>([]);
  const [isAllNftsLoaded, setIsAllNftsLoaded] = useState(false);
  const [tokenCount, setTokenCount] = useState(0);

  // NFT gallery data paging method
  const getNextNftPage = getNextNftPageFn({
    domain,
    isOwner: isOwner || false,
    nfts: nfts || [],
    nftSymbolVisible: nftSymbolVisible || {},
    records: nftAddressRecords,
    profileServiceUrl,
    itemsToUpdate,
    setIsAllNftsLoaded,
    setNftDataLoading,
    setItemsToUpdate,
    setRecords: setNftAddressRecords,
    setNfts,
    setNftSymbolVisible,
    setTokenCount,
  });

  // effect to load the first page of NFT data, and also to refresh the
  // NFT gallery when owner login status changes.
  useEffect(() => {
    if (isOwner === undefined || !enabled) {
      return;
    }
    void getNextNftPage(true);
  }, [isOwner]);

  // recursively load remaining NFT gallery data pages in the background
  // so they are available to the user later
  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (!nftDataLoading) {
      setHasNfts(nfts && nfts.length > 0);
    }

    // stop loading images if all are loaded, or none available
    if (isAllNftsLoaded || nftDataLoading || nfts?.length === 0) {
      return;
    }

    // retrieve the next page of NFT data. The method takes care of paging
    // and state management internally.
    void getNextNftPage();
  }, [nfts, isAllNftsLoaded, expanded]);

  // only render when enabled
  if (!enabled) {
    return null;
  }

  return Object.keys(nftSymbolVisible || {}).length === 0 &&
    !hasNfts &&
    !nftDataLoading ? (
    isOwner ? (
      <NftFirstTimeGalleryContainer profileServiceUrl={profileServiceUrl}>
        <div className={classes.nftGalleryConfigureButton}>
          <NftGalleryManager
            ownerAddress={ownerAddress}
            domain={domain}
            records={nftAddressRecords}
            profileServiceUrl={profileServiceUrl}
            itemsToUpdate={itemsToUpdate}
            setRecords={setNftAddressRecords}
            getNextNftPage={getNextNftPage}
            setWeb3Deps={setWeb3Deps}
            hasNfts={false}
          />
        </div>
      </NftFirstTimeGalleryContainer>
    ) : null
  ) : (
    <div>
      <div className={classes.nftGalleryHeader}>
        <Typography className={classes.sectionHeader} variant="h6">
          {t('profile.gallery')}
          {expanded && (
            <Typography
              className={classes.tokenCount}
              variant="h6"
              data-testid="token-count"
            >
              {tokenCount}
            </Typography>
          )}
        </Typography>
        <div className={cx(classes.sectionHeader, classes.nftGalleryLinks)}>
          {isOwner && (!hideConfigureButton || itemsToUpdate.length > 0) && (
            <NftGalleryManager
              ownerAddress={ownerAddress}
              domain={domain}
              records={nftAddressRecords}
              profileServiceUrl={profileServiceUrl}
              itemsToUpdate={itemsToUpdate}
              setRecords={setNftAddressRecords}
              getNextNftPage={getNextNftPage}
              setWeb3Deps={setWeb3Deps}
              hasNfts
            />
          )}
          <span
            data-testid="nftGallery-show-all-link"
            onClick={async () => {
              setExpanded(!expanded);
              return false;
            }}
            className={classes.nftShowAll}
          >
            {expanded ? (
              t('profile.collapse')
            ) : (
              <div className={classes.nftGalleryLinks}>
                <AutoAwesome sx={{marginRight: '5px'}} />{' '}
                {t('common.expandShowcase')}
              </div>
            )}
          </span>
        </div>
      </div>
      {nfts?.filter(nft => nft.public).length === 0 && !nftDataLoading ? (
        isOwner && (
          <div className={classes.nftEmptyGallery}>
            <Typography variant="body2">
              {t('nftCollection.noNftsConfigured')}
            </Typography>
          </div>
        )
      ) : expanded ? (
        <NftGalleryView
          domain={domain}
          nfts={nfts || []}
          isOwner={isOwner === true}
          nftSymbolVisible={nftSymbolVisible || {}}
          isAllNftsLoaded={isAllNftsLoaded}
          setTokenCount={setTokenCount}
        />
      ) : (
        <NFTGalleryCarousel
          domain={domain}
          nfts={
            nfts
              ? nfts.filter(nft => nft.public && nft.verified).length < 15
                ? nfts
                : nfts.filter(nft => nft.public && nft.verified).slice(0, 15)
              : []
          }
          nftSymbolVisible={nftSymbolVisible || {}}
        />
      )}
    </div>
  );
};

export default TokenGallery;
