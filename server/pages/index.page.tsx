import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Footer from 'components/app/Footer';
import {NextSeo} from 'next-seo';
import React from 'react';
import {useStyles} from 'styles/pages/index.styles';
import {GlobalStyles} from 'tss-react';

import config from '@unstoppabledomains/config';
import {
  ProfileSearchBar,
  getDomainSeoTags,
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

  const seoTags = getDomainSeoTags({
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
      <Box className={classes.content}>
        <Grid container data-testid="mainContentContainer">
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
              Find your friends and connect with the world in Web3.
            </Typography>
          </Grid>
          <Grid item xs={12} className={classes.item}>
            <Box className={classes.searchContainer}>
              <ProfileSearchBar variant="homepage" setWeb3Deps={setWeb3Deps} />
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Footer />
    </Box>
  );
};

export default HomePage;
