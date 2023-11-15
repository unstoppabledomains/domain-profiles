import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {alpha} from '@mui/material/';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useRef, useState} from 'react';
import VisibilitySensor from 'react-visibility-sensor';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {CryptoIcon} from '../../components/Image/CryptoIcon';
import type {Nft} from '../../lib';
import useTranslationContext from '../../lib/i18n';
import type {AllCurrenciesType} from '../../lib/types/blockchain';
import NftImage from './NftImage';
import NftModal from './NftModal';

const useStyles = makeStyles()((theme: Theme) => ({
  currencyIcon: {
    width: 15,
    height: 15,
    marginRight: theme.spacing(1),
  },
  visibilityIcon: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    padding: theme.spacing(0.25),
    color: theme.palette.neutralShades[700],
    backgroundColor: alpha(theme.palette.neutralShades[100], 0.35),
    backdropFilter: 'blur(5px)',
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
  loadingImg: {
    marginTop: theme.spacing(15),
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(10),
    },
  },
}));

interface Props {
  domain: string;
  nft: Nft;
  placeholder?: boolean;
}

const NftCard = ({nft, domain, placeholder}: Props) => {
  const [t] = useTranslationContext();
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const {classes, cx} = useStyles();
  const [open, setOpen] = useState<boolean>(false);

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
    if (nft.video_url) {
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

  return (
    <>
      <style>{css}</style>
      <div className={'NFT-container'} data-testid={'nft-card'}>
        <div className={'NFT-image-container'}>
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
                [classes.placeholderImg]: placeholder,
              })}
              onClick={handleClick}
              alt={nft.name}
            />
          ) : (
            <div className={cx(classes.nftImage, classes.loadingImg)}>
              <CircularProgress color="secondary" />
            </div>
          )}
        </div>
        <div className={'NFT-infoContainer'}>
          <div
            data-testid={'nft-info-name'}
            className={cx('NFT-name', {[classes.placeholderTxt]: placeholder})}
            onClick={handleClick}
          >
            {nft.symbol && (
              <div>
                <CryptoIcon
                  currency={nft.symbol as AllCurrenciesType}
                  classes={{root: classes.currencyIcon}}
                />
              </div>
            )}
            {nft.name ? (
              <div>{nft.name}</div>
            ) : (
              placeholder && <Skeleton width="50%" height={25} variant="text" />
            )}
          </div>
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
            {nft.owner &&
              nft.toggleVisibility &&
              (nft.public ? (
                <div
                  onClick={async () => {
                    nft.public = false;
                    nft.toggleVisibility!(nft.symbol!, nft.mint!, false);
                  }}
                  className={'NFT-visibility'}
                >
                  <Tooltip title={t('nftCollection.visible')}>
                    <Visibility
                      data-testid={`nftGallery-viz-icon-on-${nft.mint}`}
                      classes={{root: classes.visibilityIcon}}
                    />
                  </Tooltip>
                </div>
              ) : (
                <div
                  onClick={() => {
                    nft.public = true;
                    nft.toggleVisibility!(nft.symbol!, nft.mint!, true);
                  }}
                  className={'NFT-visibility'}
                >
                  <Tooltip title={t('nftCollection.hidden')}>
                    <VisibilityOff
                      data-testid={`nftGallery-viz-icon-off-${nft.mint}`}
                      classes={{root: classes.visibilityIcon}}
                    />
                  </Tooltip>
                </div>
              ))}
          </Typography>
        </div>
        <NftModal handleClose={handleClose} open={open} nft={nft} />
      </div>
    </>
  );
};

export default NftCard;
