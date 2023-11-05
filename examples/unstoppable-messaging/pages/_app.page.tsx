import type {NextPage} from 'next';
import type {AppProps} from 'next/app';
import Head from 'next/head';
import React from 'react';
import 'react-medium-image-zoom/dist/styles.css';
import 'swiper/css/bundle';

import {UnstoppableMessagingProvider} from '@unstoppabledomains/ui-components';

// setup wrapped app props
export type NextPageWithLayout = NextPage & {
  themeMode?: 'light' | 'dark';
};
export type WrappedAppProps = AppProps & {
  Component: NextPageWithLayout;
};

const WrappedApp = (props: WrappedAppProps) => {
  const {Component, pageProps} = props;

  return (
    <>
      <Head>
        {/* MUI - Setup */}
        {/* <meta charSet="utf-8" /> */}
        {/* Use minimum-scale=1 to enable GPU rasterization */}
        {/* Use maximum-scale=1, user-scalable=0 so that page won't be zoomed by an accident on mobile devices
          when touching input field or rotating the screen */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, shrink-to-fit=no, user-scalable=0"
        />
      </Head>
      <UnstoppableMessagingProvider>
        <Component {...pageProps} />
      </UnstoppableMessagingProvider>
    </>
  );
};

export default WrappedApp;
