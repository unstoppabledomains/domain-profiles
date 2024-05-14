import CloseFullscreenOutlinedIcon from '@mui/icons-material/CloseFullscreenOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import OpenInFullOutlinedIcon from '@mui/icons-material/OpenInFullOutlined';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
    margin: theme.spacing(6, 0, 0),
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
  emptyGalleryIcon: {
    color: theme.palette.neutralShades[600],
    marginRight: theme.spacing(1),
    height: '50px',
    width: '50px',
  },
  emptyGalleryText: {
    color: theme.palette.neutralShades[600],
  },
  nftCount: {
    color: theme.palette.neutralShades[600],
    marginLeft: theme.spacing(1),
  },
  nftGalleryLinks: {
    color: theme.palette.neutralShades[500],
  },
  nftShowAll: {
    color: theme.palette.neutralShades[500],
    fontSize: theme.typography.body2.fontSize,
    lineHeight: 1.5,
    fontWeight: theme.typography.fontWeightMedium,
    transition: theme.transitions.create('color'),
    '&:hover': {
      textDecoration: 'none',
      color: theme.palette.neutralShades[500],
    },
    cursor: 'pointer',
  },
  headerIcon: {
    color: theme.palette.neutralShades[600],
    marginRight: theme.spacing(1),
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
  const [totalCount, setTotalCount] = useState(0);

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
    setTotalCount,
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

  // hide empty gallery from visitors
  if (
    !isOwner &&
    !nftDataLoading &&
    nfts?.filter(nft => nft.public).length === 0
  ) {
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
          <PhotoLibraryOutlinedIcon className={classes.headerIcon} />
          {t('profile.gallery')}
          <Typography
            variant="body2"
            className={classes.nftCount}
            data-testid="token-count"
          >
            {totalCount > 0 && `(${totalCount})`}
          </Typography>
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
          <Box className={classes.nftShowAll}>
            {expanded ? (
              <Button
                variant="text"
                data-testid="nftGallery-show-all-link"
                startIcon={<CloseFullscreenOutlinedIcon />}
                className={classes.nftGalleryLinks}
                size="small"
                onClick={async () => {
                  setExpanded(!expanded);
                  return false;
                }}
              >
                {t('profile.collapse')}
              </Button>
            ) : (
              <Button
                variant="text"
                data-testid="nftGallery-show-all-link"
                startIcon={<OpenInFullOutlinedIcon />}
                className={classes.nftGalleryLinks}
                size="small"
                onClick={async () => {
                  setExpanded(!expanded);
                  return false;
                }}
              >
                {t('common.expand')}
              </Button>
            )}
          </Box>
        </div>
      </div>
      {nfts?.filter(nft => nft.public).length === 0 &&
      !nftDataLoading &&
      !expanded ? (
        <div className={classes.nftEmptyGallery}>
          <Box display="flex" alignItems="center">
            <InfoOutlinedIcon className={classes.emptyGalleryIcon} />
            <Typography variant="body1" className={classes.emptyGalleryText}>
              {t('nftCollection.noNftsConfigured')}
            </Typography>
          </Box>
        </div>
      ) : expanded ? (
        <NftGalleryView
          domain={domain}
          address={ownerAddress}
          nfts={nfts || []}
          isOwner={isOwner === true}
          nftSymbolVisible={nftSymbolVisible || {}}
          isAllNftsLoaded={isAllNftsLoaded}
          tokenCount={tokenCount}
          setTokenCount={setTokenCount}
          totalCount={totalCount}
        />
      ) : (
        <NFTGalleryCarousel
          domain={domain}
          address={ownerAddress}
          maxNftCount={5}
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
