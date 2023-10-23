import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import type {SerializedNftMetadata} from 'lib/types/nfts';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    boxShadow: '0px 1px 0px #DDDDDF, 0px 0px 0px 1px #DDDDDF',
    borderRadius: 8,
    padding: theme.spacing(2),
    height: 230,
    [theme.breakpoints.down('sm')]: {
      height: 341,
    },
  },
  image: {
    borderRadius: 8,
    backgroundSize: 'cover',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    textDecoration: 'none !important',
    transition: 'transform 0.2s ease-in-out',
    cursor: 'pointer',
    '&:hover': {
      transform: 'scale(1.1)',
    },
    height: '100%',
  },
  smallListingContainer: {
    height: '100%',
    '&:first-child': {
      marginTop: 0,
    },
  },
  noPaddingTop: {
    paddingTop: '0 !important',
  },
  price: {
    fontWeight: 600,
    fontSize: 12,
    color: theme.palette.white,
    background: 'rgba(0, 0, 0, 0.16)',
    backdropFilter: 'blur(50px)',
    borderRadius: 4,
    width: 'fit-content',
    padding: '1px 3px',
    height: 20,
    marginRight: theme.spacing(1),
    marginBottom: '6px',
    [theme.breakpoints.down('sm')]: {
      fontSize: 8,
      height: 14,
      marginRight: theme.spacing(0.5),
    },
  },
}));

type Props = {
  listings: SerializedNftMetadata[];
};

const NftListing: React.FC<Props> = ({listings}) => {
  const {classes} = useStyles();

  return (
    <Grid
      container
      className={classes.container}
      columnSpacing={1}
      rowSpacing={{xs: 1, sm: 0}}
    >
      {listings.slice(0, 3).map((listing, i) => (
        <Grid item xs={6} sm={3} className={i < 2 ? classes.noPaddingTop : ''}>
          <a
            href={listing.link}
            style={{
              backgroundImage: `url(${listing.image_url})`,
            }}
            className={classes.image}
          >
            <Typography className={classes.price}>
              {listing.price?.value} {listing.price?.currency}
            </Typography>
          </a>
        </Grid>
      ))}
      <Grid item xs={6} sm={3}>
        <Grid
          item
          container
          columnSpacing={1}
          rowSpacing={1}
          className={classes.smallListingContainer}
        >
          {listings.slice(3, 7).map((listing, i) => (
            <Grid
              item
              xs={6}
              md={6}
              className={i < 2 ? classes.noPaddingTop : ''}
            >
              <a
                href={listing.link}
                style={{
                  backgroundImage: `url(${listing.image_url})`,
                }}
                className={classes.image}
              >
                <Typography className={classes.price}>
                  {listing.price?.value} {listing.price?.currency}
                </Typography>
              </a>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default NftListing;
