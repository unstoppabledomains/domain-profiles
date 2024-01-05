import AddCardOutlinedIcon from '@mui/icons-material/AddCardOutlined';
import WalletOutlinedIcon from '@mui/icons-material/WalletOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React from 'react';
import SwiperCore, {Autoplay, Navigation} from 'swiper';
import {Swiper, SwiperSlide} from 'swiper/react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useDomainConfig} from '../../hooks';
import {useTranslationContext} from '../../lib';
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
  sectionHeaderContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: theme.spacing(6, 0, 0),
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

const getValue = (usdValue?: string) => {
  return parseFloat(usdValue?.replaceAll('$', '')?.replaceAll(',', '') || '0');
};

export const DomainWalletList: React.FC<DomainWalletListProps> = ({
  domain,
  isOwner,
  wallets,
  minCount = 2,
  maxCount = 3,
}) => {
  const theme = useTheme();
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const {setConfigTab, setIsOpen: setConfigOpen} = useDomainConfig();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const showCount = Math.min(wallets.length, isMobile ? minCount : maxCount);

  // hide components when there are no wallets
  if (showCount === 0) {
    return null;
  }

  // calculate total balance
  const totalValue = wallets
    .map(w => getValue(w.value?.walletUsd))
    .reduce((sum, current) => sum + current, 0);

  SwiperCore.use([Autoplay, Navigation]);

  const handleAddWallet = () => {
    setConfigTab(DomainProfileTabType.Crypto);
    setConfigOpen(true);
  };

  // render the wallet list
  return (
    <Box className={classes.walletContainer}>
      <style>{swiperCss}</style>
      <Box className={classes.sectionHeaderContainer}>
        <Box className={classes.sectionHeader}>
          <Tooltip title={t('verifiedWallets.verifiedOnly', {domain})}>
            <WalletOutlinedIcon className={classes.headerIcon} />
          </Tooltip>
          <Typography variant="h6">{t('verifiedWallets.title')}</Typography>
          {totalValue > 0 && (
            <Typography variant="body2" className={classes.totalValue}>
              (
              {totalValue.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              })}
              )
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
      <Box className={classes.swiperContainer}>
        <Swiper
          data-testid={'nft-gallery-carousel'}
          slidesPerGroup={1}
          loop={false}
          loopFillGroupWithBlank={false}
          pagination={false}
          navigation={false}
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
              .sort(
                (a, b) =>
                  parseFloat(
                    b.value?.walletUsd
                      ?.replaceAll('$', '')
                      ?.replaceAll(',', '') || '0',
                  ) -
                  parseFloat(
                    a.value?.walletUsd
                      ?.replaceAll('$', '')
                      ?.replaceAll(',', '') || '0',
                  ),
              )
              .map((wallet, index) => (
                <SwiperSlide
                  key={index}
                  data-testid={`nft-carousel-item-${index}`}
                >
                  <DomainWallet key={index} domain={domain} wallet={wallet} />
                </SwiperSlide>
              ))}
          </>
        </Swiper>
      </Box>
    </Box>
  );
};

export type DomainWalletListProps = {
  domain: string;
  isOwner?: boolean;
  wallets: SerializedWalletBalance[];
  minCount?: number;
  maxCount?: number;
};
