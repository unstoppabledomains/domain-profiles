import Box from '@mui/material/Box';
import Footer from 'components/app/Footer';
import type {GetServerSidePropsContext} from 'next';
import {NextSeo} from 'next-seo';
import React from 'react';
import {useStyles} from 'styles/pages/index.styles';
import {GlobalStyles} from 'tss-react';

import config from '@unstoppabledomains/config';
import {getWalletSeoTags} from '@unstoppabledomains/ui-components';

const WalletPage = () => {
  const {classes} = useStyles({});

  // build default wallet page SEO tags
  const seoTags = getWalletSeoTags();

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
      <Box className={classes.content}></Box>
      <Footer />
    </Box>
  );
};

// server side props for the wallet page
type WalletServerSideProps = GetServerSidePropsContext & {
  params: {
    emailAddress?: string;
    recoveryToken?: string;
  };
};

export async function getServerSideProps(props: WalletServerSideProps) {
  // determine if we have reached the launch date of April 17, 2025. This
  // check can be removed after the launch date
  const isPastLaunchDate = new Date('2025-04-17') <= new Date();

  // redirect to UP.io with exact query string parameters if the request for
  // the wallet homepage is to the UD.me domain. As an infinite redirect
  // safeguard, we also check that the forwarder does not include UP.io host.
  const shouldRedirectUpio =
    config.APP_ENV !== 'production' || isPastLaunchDate;

  // create the redirect config
  const urlParts = props.req.url?.split('?');
  const redirectConfig = {
    redirect: {
      destination: `${
        shouldRedirectUpio ? config.UP_IO_BASE_URL : config.UD_ME_BASE_URL
      }/app${urlParts && urlParts.length > 1 ? `?${urlParts[1]}` : ''}`,
      permanent: true,
    },
  };
  return redirectConfig;
}

export default WalletPage;
