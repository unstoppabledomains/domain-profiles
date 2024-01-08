import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useRef, useState} from 'react';
import type {MouseEvent} from 'react';
import VisibilitySensor from 'react-visibility-sensor';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {CryptoIcon} from '../../components/Image/CryptoIcon';
import type {Nft} from '../../lib';
import useTranslationContext from '../../lib/i18n';
import type {CurrenciesType} from '../../lib/types/blockchain';
import NftImage from './NftImage';
import NftModal from './NftModal';

const useStyles = makeStyles()((theme: Theme) => ({
  currencyIcon: {
    width: 15,
    height: 15,
    marginRight: theme.spacing(1),
  },
  nftImage: {
    justifyContent: 'center',
    verticalAlign: 'center',
    textAlign: 'center',
    cursor: 'pointer',
    objectFit: 'fill',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    maxWidth: '100%',
    minWidth: '100%',
  },
  placeholderImg: {
    filter: 'grayscale(100%)',
    opacity: 0.5,
  },
  placeholderTxt: {
    color: theme.palette.neutralShades[600],
  },
  loadingContainer: {
    display: 'flex',
    alignContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  loadingImg: {
    padding: theme.spacing(1),
  },
  optionsButton: {
    marginRight: theme.spacing(-1),
  },
  compactText: {
    color: theme.palette.neutralShades[400],
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  compactTitle: {
    color: theme.palette.neutralShades[500],
    fontWeight: 'bold',
  },
}));

interface Props {
  domain: string;
  nft: Nft;
  placeholder?: boolean;
  compact?: boolean;
}

const NftCard = ({nft, compact, placeholder}: Props) => {
  const [t] = useTranslationContext();
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const {classes, cx} = useStyles();
  const [open, setOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const css = `
  .NFT-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    background-color: white;
    padding-top: 0px;
    transition: all 0.3s ease 0s;
    border-radius: 12px;
    box-shadow: 0px 1px 0px #DDDDDF, 0px 0px 0px 1px #DDDDDF;
    overflow: hidden;
  }
  .NFT-container:hover {
    box-shadow: rgba(0, 0, 0, 0.22) 0px 5px 10px;
    transform: translate3d(0px, -2px, 0px);
    transition: all 0.3s ease 0s;
  }
  .NFT-image-container {
    position: relative;
    width: 100%;
    overflow: hidden;
  }
  .NFT-image-container:before {
    content: "";
    display: block;
    padding-top: 100%;
  }
  .NFT-infoContainer {
    padding: 16px;
  }
  .NFT-visibility {
    float: right;
    position: absolute;
    top: 17px;
    right: 17px;
    cursor: pointer;
  }
  .NFT-name {
    font-family: "Inter", sans-serif;
    font-style: normal;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis; 
    text-align: left;
    position: static;
    font-weight: 600;
    font-size: 1rem;
    display: flex;
    flex-direction: row;
    white-space: nowrap;
    align-items: "center";
    align-content: "center";
    text-align: "center";
  }
  .NFT-description {
    font-family: "Inter", sans-serif;
    font-style: normal;
    font-size: 15px;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #6d6e76;
    text-align: left;
    min-height: 43px;
    margin-top: 8px;
  }
  .NFT-collection {
    height: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .more {
    font-family: "Inter", sans-serif;
    font-style: normal;
    cursor: pointer;
    color: black;
    font-weight: 600;
    margin-left: 5px;
  }
  `;

  const handleClose = () => setOpen(false);

  const handleClick = async () => {
    //only open modal if feature flag is set
    if (!nft.link) {
      return;
    }
    setOpen(true);
  };

  useEffect(() => {
    if (isVisible) {
      if (videoRef?.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (videoRef.current as any).play();
      }
    } else {
      if (videoRef?.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (videoRef.current as any).pause();
      }
    }
  }, [isVisible]);

  const shouldRenderVideo = () => {
    if (nft.video_url && !nft.image_url) {
      if (
        !nft.video_url.endsWith('.gif') &&
        !nft.video_url.endsWith('.gltf') &&
        !nft.video_url.endsWith('.glb') &&
        !nft.video_url.endsWith('.mp3')
      ) {
        return true;
      }
    }
    // For case when image_url incorrectly provides video file
    if (nft.image_url?.endsWith('.mp4')) {
      return true;
    }
    return false;
  };

  const handleOpenMenu = (e: MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleToggleNftVisibility = (v: boolean) => {
    if (nft.symbol && nft.mint) {
      nft.public = v;
      nft.toggleVisibility!(nft.symbol, nft.mint, v);
    }
  };

  const handleToggleCollectionVisibility = (v: boolean) => {
    if (nft.symbol && nft.mint) {
      const collectionId = nft.mint!.split('/')[0];
      nft.public = v;
      nft.toggleVisibility!(nft.symbol!, collectionId, v);
      nft.peerNfts
        ?.filter(
          peerNft =>
            !!peerNft.public !== v &&
            peerNft.mint &&
            peerNft.symbol &&
            peerNft.toggleVisibility &&
            peerNft.mint?.includes(collectionId),
        )
        .map(peerNft => {
          peerNft.public = v;
          peerNft.toggleVisibility!(peerNft.symbol!, peerNft.mint!, v);
        });
    }
  };

  return (
    <>
      <style>{css}</style>
      <Box className={'NFT-container'} data-testid={'nft-card'}>
        <Box className={'NFT-image-container'}>
          {shouldRenderVideo() ? (
            <VisibilitySensor
              onChange={(isVis: boolean) => setIsVisible(isVis)}
            >
              <video
                onClick={handleClick}
                muted
                playsInline
                autoPlay
                controlsList="nodownload"
                loop
                preload="auto"
                src={nft.video_url || nft.image_url}
                className={classes.nftImage}
                ref={videoRef}
              />
            </VisibilitySensor>
          ) : nft.image_url ? (
            <NftImage
              src={nft.image_url}
              className={cx(classes.nftImage, {
                [classes.placeholderImg]: placeholder || !nft.public,
              })}
              onClick={handleClick}
              alt={nft.name}
            />
          ) : (
            <Box className={cx(classes.nftImage, classes.loadingContainer)}>
              <CircularProgress
                className={classes.loadingImg}
                color="secondary"
              />
            </Box>
          )}
        </Box>
        {!compact && (
          <Box className={'NFT-infoContainer'}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              alignContent="center"
            >
              <Box
                data-testid={'nft-info-name'}
                className={cx('NFT-name', {
                  [classes.placeholderTxt]: placeholder || !nft.public,
                })}
                onClick={handleClick}
                alignItems="center"
                alignContent="center"
                textAlign="center"
                display="flex"
              >
                {nft.symbol && (
                  <CryptoIcon
                    currency={nft.symbol as CurrenciesType}
                    classes={{root: classes.currencyIcon}}
                  />
                )}
                {nft.name ? (
                  <Typography>{nft.name}</Typography>
                ) : (
                  placeholder && (
                    <Skeleton width="300px" height={25} variant="text" />
                  )
                )}
              </Box>
              {nft.owner && nft.toggleVisibility && (
                <IconButton
                  data-testid="nft-card-more-info"
                  className={classes.optionsButton}
                  onClick={handleOpenMenu}
                >
                  <MoreVertIcon />
                </IconButton>
              )}
            </Box>
            <Typography
              className={cx('NFT-collection', {
                [classes.placeholderTxt]: placeholder,
              })}
              variant="caption"
            >
              {nft?.collection
                ? nft.collection
                : placeholder && (
                    <Skeleton width="75%" height={22} variant="text" />
                  )}
            </Typography>
          </Box>
        )}
        <Menu
          anchorEl={anchorEl}
          onClose={handleCloseMenu}
          open={Boolean(anchorEl)}
          transformOrigin={{horizontal: 'right', vertical: 'top'}}
          anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
        >
          <MenuItem
            data-testid="nft-card-hide-nft"
            onClick={async () => {
              handleCloseMenu();
              handleToggleNftVisibility(nft.public ? false : true);
            }}
          >
            <ListItemIcon>
              <ImageOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="body2">
              {t('nftCollection.showHideNft', {
                action: nft.public
                  ? t('nftCollection.hide')
                  : t('nftCollection.show'),
              })}
            </Typography>
          </MenuItem>
          <MenuItem
            onClick={async () => {
              handleCloseMenu();
              handleToggleCollectionVisibility(nft.public ? false : true);
            }}
          >
            <ListItemIcon>
              <CollectionsOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="body2">
              {t('nftCollection.showHideCollection', {
                action: nft.public
                  ? t('nftCollection.hide')
                  : t('nftCollection.show'),
              })}
            </Typography>
          </MenuItem>
        </Menu>
        <NftModal handleClose={handleClose} open={open} nft={nft} />
      </Box>
      {compact && (
        <Box mt={1} display="flex" flexDirection="column">
          {nft.name ? (
            <Typography
              className={cx(classes.compactText, classes.compactTitle)}
              variant="caption"
            >
              {nft.name}
            </Typography>
          ) : (
            placeholder && <Skeleton width="100%" height={24} variant="text" />
          )}
          {nft.collection ? (
            <Typography className={cx(classes.compactText)} variant="caption">
              {nft.collection}
            </Typography>
          ) : (
            placeholder && <Skeleton width="60%" height={24} variant="text" />
          )}
        </Box>
      )}
    </>
  );
};

export default NftCard;
