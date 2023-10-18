import Close from '@mui/icons-material/Close';
import OpenInNew from '@mui/icons-material/OpenInNew';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {CryptoIcon} from 'components/Image/CryptoIcon';
import useTranslationContext from 'lib/i18n';
import type {AllCurrenciesType} from 'lib/types/blockchain';
import React from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import type {Nft} from './NftCard';
import NftImage from './NftImage';

const useStyles = makeStyles()((theme: Theme) => ({
  nftModal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    [theme.breakpoints.down('sm')]: {
      '&.MuiBackdrop-root': {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        filter: 'blur(0.5rem)',
      },
    },
    '&::focus': {outline: 'none !important'},
  },

  nftGrid: {
    overflowY: 'scroll',
    maxHeight: '100vh',
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(50px)',
    width: theme.spacing(145),
    p: theme.spacing(3),
    borderRadius: '1.5rem',
    [theme.breakpoints.between('xs', 'sm')]: {
      overflowX: 'unset',
      maxHeight: '100vh',
    },
    [theme.breakpoints.only('xs')]: {
      p: theme.spacing(1.5),
      height: 'auto',
      width: 'auto',
      borderRadius: 0,
    },
    [theme.breakpoints.up('sm')]: {
      marginLeft: '1rem',
      marginRight: '1rem',
    },
  },
  mobileImageIcon: {
    position: 'relative',
  },

  nftImgContainer: {
    width: theme.spacing(71.75),
    alignItems: 'center',
    height: '100%',
    [theme.breakpoints.only('xs')]: {
      display: 'block',
      p: theme.spacing(1.5),
      maxHeight: '100vh',
      alignItems: 'center',
      width: 'auto',
    },
    [theme.breakpoints.between('sm', 'md')]: {
      width: '100%',
    },
  },

  nftImg: {
    width: 'inherit',
    height: 'inherit',
    maxWidth: 'inherit',
    maxHeight: 'inherit',
    objectFit: 'cover',
    alignContent: 'center',
    borderTopLeftRadius: '1.5rem',
    borderBottomLeftRadius: '1.5rem',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },

    [theme.breakpoints.only('xs')]: {
      borderRadius: 0,
    },
  },

  nftInfoContainer: {
    display: 'flex',
    flexFlow: 'column',
    maxHeight: '100vh',
    overflowY: 'scroll',
    height: theme.spacing(72.0625),
    width: theme.spacing(71.75),

    [theme.breakpoints.between('sm', 'md')]: {
      height: 'inherit',
      width: 'inherit',
    },

    [theme.breakpoints.only('xs')]: {
      height: 'inherit',
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      width: 'inherit',
    },

    [theme.breakpoints.down('md')]: {
      p: theme.spacing(4),
    },

    borderTopRightRadius: '1.5rem',
    borderBottomRightRadius: '1.5rem',
    padding: theme.spacing(4),
    color: '#fff',
  },
  currencyIcon: {
    width: 15,
    height: 15,
    marginLeft: '0.2rem',
    paddingTop: '0.3rem',
  },
  description: {
    paddingTop: '3rem',
  },
  text: {
    marginTop: '1rem',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: '1.5rem',
    flexFlow: 'column wrap',
  },
  nftDetailsSectionName: {
    color: 'rgba(255, 255, 255, 0.7)',
    wordBreak: 'unset',
  },
  sectionName: {
    fontSize: '1.125rem',
    marginBottom: '1rem',
  },
  button: {
    marginTop: '2rem',
    color: '#fff',
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  newWindowIcon: {
    marginRight: '0.5rem',
  },
  descriptionLink: {
    fontWeight: 'bold',
    color: '#fff',
    textDecoration: 'none',
  },
  closeIconSection: {
    [theme.breakpoints.up('sm')]: {
      display: 'flex',
      justifyContent: 'flex-end',
    },

    [theme.breakpoints.only('xs')]: {
      position: 'absolute',
      top: '5vw',
      left: '90vw',
    },
  },

  closeIcon: {
    color: '#fff',
  },

  detailsText: {
    display: 'flex',
    flexFlow: 'row',
  },

  detailSections: {
    marginRight: '1.5rem',
    [theme.breakpoints.only('sm')]: {
      fontSize: '12px',
    },
  },

  contractLink: {
    fontSize: '14px',
    [theme.breakpoints.only('sm')]: {
      fontSize: '12px',
    },
  },
}));

export interface NftModalProps {
  handleClose: () => void;
  open: boolean;
  nft: Nft;
}

const NftModal: React.FC<NftModalProps> = ({
  open,
  handleClose,
  nft,
}: NftModalProps) => {
  const {classes, cx} = useStyles();
  const [t] = useTranslationContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  let udMeLink: string | undefined;
  if (nft?.mint) {
    const contractAddress = nft.mint.split('/')[0];
    if (
      config.UNSTOPPABLE_CONTRACT_ADDRESS.includes(
        contractAddress.toLowerCase(),
      )
    ) {
      udMeLink = `${config.UD_ME_BASE_URL}/${nft.name}`;
    }
  }

  const handleContractAddress = (contract: string, index = 0) => {
    const splitContract = contract?.split('/');
    const modifiedContractStr =
      splitContract?.length > index ? splitContract[index] : splitContract[0];
    const displayContractStr =
      modifiedContractStr.length > 5
        ? `${modifiedContractStr?.slice(0, 5)}...${modifiedContractStr?.slice(
            -4,
          )}`
        : modifiedContractStr;
    return (
      <Link
        data-testid={'contract-details'}
        className={cx(classes.descriptionLink, classes.contractLink)}
        href={nft.link}
        target={'_blank'}
      >
        <Typography variant={'subtitle2'}>
          {displayContractStr}{' '}
          <OpenInNew sx={{verticalAlign: 'middle'}} fontSize={'small'} />
        </Typography>
      </Link>
    );
  };

  const handleDescription = (description: string, marketplaceUrl: string) => {
    if (description?.length > 205) {
      return (
        <>
          <Typography
            variant="body1"
            className={classes.text}
            data-testid={'modal-description'}
          >
            {description.substring(0, 205)} ...
          </Typography>
          <Link
            className={classes.descriptionLink}
            href={marketplaceUrl}
            target="_blank"
            data-testid="see-more-link"
          >
            {t('nftCollection.seeMore')}
          </Link>
        </>
      );
    }
    return (
      <>
        <Typography
          variant="body1"
          className={classes.text}
          data-testid={'modal-description'}
        >
          {description}
        </Typography>
      </>
    );
  };

  const handleTitle = (): string => {
    if (!nft.collection) return nft.name;
    return nft.collection;
  };

  return open ? (
    <Modal
      disableAutoFocus={true}
      open={open}
      onClose={handleClose}
      data-testid="nft-modal"
      className={classes.nftModal}
      keepMounted
    >
      <Grid
        container
        justifyContent="center"
        className={classes.nftGrid}
        spacing={0}
      >
        <Grid item xs={12} sm={6}>
          <section className={classes.nftImgContainer}>
            {isMobile ? (
              <div className={classes.mobileImageIcon}>
                <section className={classes.closeIconSection}>
                  <IconButton color={'inherit'} onClick={handleClose}>
                    <Close className={classes.closeIcon} fontSize={'small'} />
                  </IconButton>
                </section>
                <NftImage
                  alt={nft.collection}
                  src={nft.image_url}
                  className={classes.nftImg}
                />
              </div>
            ) : (
              <NftImage
                alt={nft.collection}
                src={nft.image_url}
                className={classes.nftImg}
              />
            )}
          </section>
        </Grid>
        <Grid item xs={12} sm={6}>
          <div className={classes.nftInfoContainer}>
            {!isMobile && (
              <section className={classes.closeIconSection}>
                <IconButton color={'inherit'} onClick={handleClose}>
                  <Close className={classes.closeIcon} fontSize={'small'} />
                </IconButton>
              </section>
            )}
            <section>
              <Typography variant="body1">
                {handleTitle()}
                <CryptoIcon
                  currency={nft.symbol as AllCurrenciesType}
                  classes={{root: classes.currencyIcon}}
                />
              </Typography>
              <Typography variant="h4">{nft.name}</Typography>
            </section>
            {nft.description && (
              <section className={classes.description}>
                <Typography variant="subtitle2" className={classes.sectionName}>
                  {t('nftCollection.description')}
                </Typography>
                {handleDescription(nft.description, nft.link)}
              </section>
            )}
            {(nft.symbol || nft.mint) && (
              <section className={classes.details}>
                <Typography variant="subtitle2" className={classes.sectionName}>
                  {t('nftCollection.nftDetails')}
                </Typography>
                <div className={classes.detailsText}>
                  {nft.symbol && (
                    <div className={classes.detailSections}>
                      <Typography
                        className={classes.nftDetailsSectionName}
                        variant="body1"
                      >
                        {t('nftCollection.blockchain')}
                      </Typography>
                      <Typography variant="subtitle2">{nft.symbol}</Typography>
                    </div>
                  )}
                  {nft.mint?.includes('/') && (
                    <div className={classes.detailSections}>
                      <Typography
                        className={classes.nftDetailsSectionName}
                        data-testid={'contract-header'}
                        variant="body1"
                      >
                        {t('nftCollection.contract')}
                      </Typography>
                      {handleContractAddress(nft?.mint || '')}
                    </div>
                  )}
                  {nft.mint && (
                    <div className={classes.detailSections}>
                      <Typography
                        className={classes.nftDetailsSectionName}
                        data-testid={'token-id-header'}
                        variant="body1"
                      >
                        {t('nftCollection.tokenId')}
                      </Typography>
                      {handleContractAddress(nft?.mint || '', 1)}
                    </div>
                  )}
                </div>
              </section>
            )}
            {nft.link && (
              <Button
                variant="outlined"
                className={classes.button}
                onClick={() => window.open(nft.link, '_blank')}
              >
                <OpenInNew className={classes.newWindowIcon} />
                {t('nftCollection.viewInMarketplace')}
              </Button>
            )}
            {udMeLink && (
              <Button
                variant="outlined"
                className={classes.button}
                onClick={() => window.open(udMeLink, '_blank')}
                data-testid="modal-udmelink"
              >
                <OpenInNew className={classes.newWindowIcon} />
                {t('nftCollection.viewUdMeProfile')}
              </Button>
            )}
          </div>
        </Grid>
      </Grid>
    </Modal>
  ) : null;
};

export default NftModal;
