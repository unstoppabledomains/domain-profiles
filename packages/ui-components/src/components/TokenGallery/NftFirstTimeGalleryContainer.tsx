import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import type {ReactNode} from 'react';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import useTranslationContext from '../../lib/i18n';

interface Props {
  profileServiceUrl: string;
  children: ReactNode;
  className?: string;
}

const useStyles = makeStyles()((theme: Theme) => ({
  nftGalleryFirstTimeContainer: {
    background: theme.palette.neutralShades[100],
    borderRadius: theme.shape.borderRadius,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    verticalAlign: 'center',
    textAlign: 'center',
    marginTop: theme.spacing(6),
    border: `${theme.palette.neutralShades[400]} 1px dashed`,
    paddingTop: '24px',
  },
  nftGalleryFirstTimeImg: {
    maxWidth: '25%',
    marginTop: theme.spacing(-2),
    marginBottom: theme.spacing(-4),
  },
  nftGalleryFirstTimeHeader: {
    color: '#62626A',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}));

const NftFirstTimeGalleryContainer = ({
  profileServiceUrl,
  children,
  className,
}: Props) => {
  const [t] = useTranslationContext();
  const {classes, cx} = useStyles();

  return (
    <div className={cx(classes.nftGalleryFirstTimeContainer, className)}>
      <img
        className={classes.nftGalleryFirstTimeImg}
        src="https://storage.googleapis.com/unstoppable-client-assets/nft-gallery/nft-gallery-config.png"
      />
      <Typography
        data-testid={`nftGallery-firstTimeConfigTitle`}
        className={classes.nftGalleryFirstTimeHeader}
        variant="h6"
      >
        {t('nftCollection.firstTimeConfigTitle')}
      </Typography>
      <Typography variant="body2" color="GrayText" component="div">
        {t('nftCollection.firstTimeConfigDescription')}
      </Typography>
      {children}
    </div>
  );
};

export default NftFirstTimeGalleryContainer;
