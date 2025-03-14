import type {NextPage} from 'next';
import type {AppProps} from 'next/app';
import Head from 'next/head';
import React from 'react';
import 'react-medium-image-zoom/dist/styles.css';
import 'swiper/css/bundle';

import {
  BaseProvider,
  UnstoppableMessagingProvider,
} from '@unstoppabledomains/ui-components';
import type {ThemeMode} from '@unstoppabledomains/ui-components/src/styles/theme/index';

// setup wrapped app props
export type NextPageWithLayout = NextPage & {
  themeMode?: ThemeMode;
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
      <BaseProvider>
        <UnstoppableMessagingProvider>
          <Component {...pageProps} />
        </UnstoppableMessagingProvider>
      </BaseProvider>
    </>
  );
};

export default WrappedApp;
