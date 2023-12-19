import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import {NextSeo} from 'next-seo';
import React from 'react';
import {useStyles} from 'styles/pages/index.styles';

import {
  ProfileSearchBar,
  getSeoTags,
  useTranslationContext,
  useWeb3Context,
} from '@unstoppabledomains/ui-components';

const HomePage = () => {
  const {classes, cx} = useStyles();
  const {setWeb3Deps} = useWeb3Context();
  const [t] = useTranslationContext();

  const seoTags = getSeoTags({
    title: t('nftCollection.unstoppableDomains'),
  });

  return (
    <Box className={classes.container}>
      <NextSeo {...seoTags} />
      <Grid
        container
        className={classes.content}
        data-testid="mainContentContainer"
      >
        <Grid item xs={12} className={classes.item}>
          <img
            width={280}
            height={200}
            src="https://storage.googleapis.com/unstoppable-client-assets/images/homepage/how-mint.svg"
          />
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
    </Box>
  );
};

export default HomePage;
