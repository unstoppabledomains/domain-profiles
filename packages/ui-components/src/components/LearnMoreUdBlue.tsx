import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {keyframes} from '@mui/system';
import qs from 'qs';
import React from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import getImageUrl from '../lib/domain/getImageUrl';
import useTranslationContext from '../lib/i18n';
import {UdBlueBasicFeatureList} from '../lib/types/product';

interface LearnMoreUdBlueProps {
  isOpen: boolean;
  handleClose: () => void;
}

const bannerSale = keyframes`
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(-50%, 0, 0);
  }
`;

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    '& .MuiPaper-root': {
      minWidth: '420px',
      maxWidth: '420px',
      alignItems: 'center',
      [theme.breakpoints.down('md')]: {
        minWidth: '100%',
        maxWidth: '100%',
        overflowX: 'hidden',
      },
    },
    '& .MuiDialogContent-root': {
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      [theme.breakpoints.down('md')]: {
        padding: 0,
      },
    },
  },
  imgContainer: {
    position: 'relative',
    '&::after': {
      content: '""',
      clear: 'both',
      display: 'table',
    },
  },
  img: {
    display: 'block',
    width: 420,
  },
  featuresContainer: {
    padding: theme.spacing(1),
    paddingBottom: theme.spacing(2),
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    textAlign: 'center',
    lineHeight: '25px',
    color: 'rgba(255, 255, 255, 0.56)',
  },
  featureItemText: {
    whiteSpace: 'break-spaces',
    padding: '0 8px',
    display: 'inline',
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: '20px',
    fontSize: 14,
  },
  breaker: {
    padding: 0,
    margin: 0,
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: '20px',
    fontSize: 14,
    display: 'inline',
  },
  redArea: {
    height: 24,
    backgroundColor: '#E72113',
    maxWidth: 420,
    [theme.breakpoints.down('md')]: {
      minWidth: '100%',
    },
    overflow: 'hidden',
  },
  bannerSale: {
    whiteSpace: 'nowrap',
    display: 'inline-block',
    animation: `${bannerSale} 15s linear infinite`,
  },
  whiteText: {
    fontSize: 14,
    fontWeight: 700,
    lineHeight: '24px',
    padding: '0 8px',
    color: theme.palette.white,
    display: 'inline-block',
    textTransform: 'uppercase',
  },
  contentContainer: {
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: theme.typography.fontWeightBold,
    textAlign: 'center',
    paddingBottom: theme.spacing(3),
  },
  selectPlan: {
    width: '100%',
    marginBottom: theme.spacing(3),
  },
  closeButton: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    color: theme.palette.white,
  },
}));

const LearnMoreUdBlue = ({isOpen, handleClose}: LearnMoreUdBlueProps) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const featuresLength = UdBlueBasicFeatureList.length;

  return (
    <Dialog
      className={classes.container}
      open={isOpen}
      onClose={handleClose}
      data-testid={'learn-more-ud-blue'}
    >
      <DialogContent>
        <Box className={classes.imgContainer}>
          <IconButton className={classes.closeButton} onClick={handleClose}>
            <CloseIcon />
          </IconButton>
          <img
            className={classes.img}
            src={getImageUrl('/ud-blue/background.svg')}
            alt="Unstoppable Blue Background"
          />
          <Box className={classes.featuresContainer}>
            {UdBlueBasicFeatureList.map((feature, index) => (
              <React.Fragment key={index}>
                <Typography className={classes.featureItemText}>
                  {feature}
                </Typography>
                {index !== featuresLength - 1 && (
                  <Typography className={classes.breaker}>·</Typography>
                )}
              </React.Fragment>
            ))}
          </Box>
        </Box>
        <Box className={classes.redArea}>
          <Box className={classes.bannerSale}>
            {Array(8)
              .fill(true)
              .map((_, i) => (
                <Typography key={i} className={classes.whiteText}>
                  {t('upsell.udBlueSubscription.limitedTimeDeal')}
                </Typography>
              ))}
          </Box>
        </Box>
        <Box className={classes.contentContainer}>
          <Typography className={classes.title}>
            {t('upsell.udBlueSubscription.tooltip')}
          </Typography>
          <Button
            variant="contained"
            className={classes.selectPlan}
            href={`${config.UNSTOPPABLE_WEBSITE_URL}/cart?${qs.stringify({
              product: 'unstoppable_blue_basic',
            })}`}
          >
            <AddShoppingCartIcon />
            &nbsp;
            {t('upsell.udBlueSubscription.addToCart', {
              price: '$19.99',
            })}
          </Button>
          <Button
            fullWidth
            href={`${config.UNSTOPPABLE_WEBSITE_URL}/products/blue`}
          >
            {t('upsell.udBlueSubscription.learnMore')}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LearnMoreUdBlue;
