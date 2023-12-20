import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import {NextSeo} from 'next-seo';
import React from 'react';
import {useStyles} from 'styles/pages/index.styles';
import {GlobalStyles} from 'tss-react';

import config from '@unstoppabledomains/config';
import {
  ProfileSearchBar,
  getSeoTags,
  useTranslationContext,
  useWeb3Context,
} from '@unstoppabledomains/ui-components';

export const nftCardsArray = [
  `${config.ASSETS_BUCKET_URL}/images/landing/new/nft_pfp_card_3.webp`,
  `${config.ASSETS_BUCKET_URL}/images/landing/new/nft_pfp_card_4.webp`,
];

const getRandomNftCards = (arr: string[]) => {
  const firstNFTCard = arr[Math.floor(Math.random() * arr.length)];
  const filteredNftCardsArray = arr.filter(card => card !== firstNFTCard);
  const secondNFTCard =
    filteredNftCardsArray[
      Math.floor(Math.random() * filteredNftCardsArray.length)
    ];

  return [firstNFTCard, secondNFTCard];
};

const HomePage = () => {
  const {classes, cx} = useStyles({});
  const {setWeb3Deps} = useWeb3Context();
  const [t] = useTranslationContext();
  const [firstNFTCard, secondNFTCard] = getRandomNftCards(nftCardsArray);

  const seoTags = getSeoTags({
    title: t('nftCollection.unstoppableDomains'),
  });

  return (
    <Box className={classes.container}>
      <NextSeo {...seoTags} />
      <GlobalStyles
        styles={{
          '@font-face': {
            fontFamily: 'Helvetica Neue',
            src: `url('${config.ASSETS_BUCKET_URL}/fonts/HelveticaNeueLT97BlackCondensed.ttf') format('truetype')`,
            fontWeight: 900,
            fontStyle: 'normal',
            fontDisplay: 'swap',
          },
        }}
      />
      <Grid
        container
        className={classes.content}
        data-testid="mainContentContainer"
      >
        <Grid item xs={12} className={classes.item}>
          <Box className={classes.rightBlock}>
            <img
              src={firstNFTCard}
              alt="nft-card-1"
              className={cx(classes.cardImage, classes.cardImageTop)}
            />
            <img
              src={secondNFTCard}
              alt="nft-card-2"
              className={cx(classes.cardImage, classes.cardImageBottom)}
            />
          </Box>
        </Grid>
        <Grid item xs={12} className={classes.item}>
          <Typography className={classes.sectionTitle}>
            Unstoppable Profiles
          </Typography>
        </Grid>
        <Grid item xs={12} className={classes.item}>
          <Typography className={classes.sectionSubTitle}>
            Own your identity in the digital world.
          </Typography>
        </Grid>
        <Grid item xs={12} className={classes.item}>
          <Box className={classes.searchContainer}>
            <ProfileSearchBar variant="homepage" setWeb3Deps={setWeb3Deps} />
          </Box>
        </Grid>
      </Grid>
      <Box className={classes.footerContainer}>
        <Box className={classes.footerContent}>
          <Typography className={classes.copyright} variant="body2">
            {t('footer.copyright')}
          </Typography>
        </Box>
        <Box className={classes.footerContent}>
          <Typography variant="caption">
            <a
              className={classes.footerLink}
              href="https://unstoppabledomains.com/terms"
            >
              {t('footer.terms')}
            </a>
            <a
              className={classes.footerLink}
              href="https://unstoppabledomains.com/privacy-policy"
            >
              {t('footer.privacyPolicy')}
            </a>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;
