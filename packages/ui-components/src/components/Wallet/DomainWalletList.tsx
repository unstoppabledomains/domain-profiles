import AddCardOutlinedIcon from '@mui/icons-material/AddCardOutlined';
import WalletOutlinedIcon from '@mui/icons-material/WalletOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import numeral from 'numeral';
import React, {useState} from 'react';
import SwiperCore, {Autoplay, Navigation} from 'swiper';
import {Swiper, SwiperSlide} from 'swiper/react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useDomainConfig} from '../../hooks';
import {WALLET_CARD_HEIGHT, useTranslationContext} from '../../lib';
import type {SerializedWalletBalance} from '../../lib/types/domain';
import {DomainProfileTabType} from '../Manage';
import {DomainWallet} from './DomainWallet';

const useStyles = makeStyles()((theme: Theme) => ({
  button: {
    color: theme.palette.neutralShades[500],
  },
  walletContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  walletPlaceholder: {
    height: `${WALLET_CARD_HEIGHT}px`,
    width: '100%',
    borderRadius: theme.shape.borderRadius,
  },
  sectionHeaderContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: theme.spacing(6, 0, 0),
    minHeight: '42px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.h5.fontSize,
    lineHeight: 1.4,
  },
  totalValue: {
    color: theme.palette.neutralShades[600],
    marginLeft: theme.spacing(1),
  },
  headerIcon: {
    color: theme.palette.neutralShades[600],
    marginRight: theme.spacing(1),
  },
  swiperContainer: {
    marginLeft: '-2px',
  },
  swiper: {
    paddingTop: theme.spacing(2),
    paddingLeft: '1px',
    paddingRight: '1px',
  },
}));

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

export const DomainWalletList: React.FC<DomainWalletListProps> = ({
  domain,
  isOwner,
  wallets,
  minCount = 1,
  maxCount = 1,
  verified,
}) => {
  const theme = useTheme();
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const [showWalletNav, setShowWalletNav] = useState(false);
  const {setConfigTab, setIsOpen: setConfigOpen} = useDomainConfig();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const showCount = wallets
    ? Math.min(wallets.length, isMobile ? minCount : maxCount)
    : minCount;

  // hide components when there are no wallets
  if (showCount === 0) {
    return null;
  }

  // calculate total balance
  const totalValue =
    wallets
      ?.map(w => w.totalValueUsdAmt || 0)
      .reduce((sum, current) => sum + current, 0) || 0;

  SwiperCore.use([Autoplay, Navigation]);

  const handleAddWallet = () => {
    setConfigTab(DomainProfileTabType.Crypto);
    setConfigOpen(true);
  };

  const getDisplayBalance = (balanceUsd: number): string => {
    return numeral(balanceUsd).format('$0.00a');
  };

  // render the wallet list
  return (
    <Box className={classes.walletContainer}>
      <style>{swiperCss}</style>
      <Box className={classes.sectionHeaderContainer}>
        <Box className={classes.sectionHeader}>
          {domain && (
            <Tooltip
              title={t(
                verified
                  ? 'verifiedWallets.verifiedOnly'
                  : 'verifiedWallets.notVerified',
                {domain},
              )}
            >
              <WalletOutlinedIcon className={classes.headerIcon} />
            </Tooltip>
          )}
          <Typography variant="h6">{t('verifiedWallets.title')}</Typography>
          {totalValue > 0 && (
            <Typography variant="body2" className={classes.totalValue}>
              ({getDisplayBalance(totalValue)})
            </Typography>
          )}
        </Box>
        {isOwner && (
          <Button
            startIcon={<AddCardOutlinedIcon />}
            className={classes.button}
            onClick={handleAddWallet}
            variant="text"
            size="small"
          >
            {t('verifiedWallets.addWallet')}
          </Button>
        )}
      </Box>
      {wallets ? (
        <Box
          className={classes.swiperContainer}
          onMouseEnter={() => setShowWalletNav(true)}
          onMouseLeave={() => setShowWalletNav(false)}
        >
          <Swiper
            data-testid={'wallet-carousel'}
            slidesPerGroup={1}
            loop={true}
            loopFillGroupWithBlank={false}
            pagination={false}
            navigation={showWalletNav}
            className={classes.swiper}
            autoplay={false}
            breakpoints={{
              0: {
                slidesPerView: Math.min(showCount, minCount),
                spaceBetween: 16,
              },
              320: {
                slidesPerView: Math.min(showCount, minCount),
                spaceBetween: 16,
              },
              // when window width is >= 600px
              600: {
                slidesPerView: Math.min(showCount, minCount),
                spaceBetween: 16,
              },
              // when window width is >= 640px
              768: {
                slidesPerView: Math.min(showCount, maxCount),
                spaceBetween: 16,
              },
            }}
          >
            <>
              {wallets
                ?.sort(
                  (a, b) =>
                    (b.totalValueUsdAmt || 0) - (a.totalValueUsdAmt || 0),
                )
                .map((wallet, index) => (
                  <SwiperSlide
                    key={index}
                    data-testid={`nft-carousel-item-${index}`}
                  >
                    <DomainWallet key={index} wallet={wallet} />
                  </SwiperSlide>
                ))}
            </>
          </Swiper>
        </Box>
      ) : (
        <Grid mt="0px" mb={1.5} container spacing={2}>
          <Grid item xs={12}>
            <Skeleton
              variant="rectangular"
              className={classes.walletPlaceholder}
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export type DomainWalletListProps = {
  domain?: string;
  isOwner?: boolean;
  wallets?: SerializedWalletBalance[];
  minCount?: number;
  maxCount?: number;
  verified: boolean;
};
