import CssBaseline from '@mui/material/CssBaseline';
import {ThemeProvider} from '@mui/material/styles';
import type {NextPage} from 'next';
import type {AppProps} from 'next/app';
import Head from 'next/head';
import {SnackbarProvider} from 'notistack';
import React from 'react';
import 'react-medium-image-zoom/dist/styles.css';
import {QueryClient, QueryClientProvider} from 'react-query';
import 'swiper/css/bundle';
import {createEmotionSsrAdvancedApproach} from 'tss-react/nextJs';

import {
  TranslationProvider,
  UnstoppableMessagingProvider,
  Web3ContextProvider,
} from '@unstoppabledomains/ui-components';
import {darkTheme, lightTheme} from '@unstoppabledomains/ui-kit/styles';

// setup query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // We want cacheTime to be a balance - long enough to improve load speed for frequently used
      // queries, while short enough to avoid using too much memory for long browsing sessions. While
      // it makes sense for react-query to have an aggressive 5 minute default, 24 hours seems more
      // appropriate for our app. For comparison, the `swr` module never clears cache keys.
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

// setup emotion cache for MUI
const {EmotionCacheProvider, withEmotionCache} =
  createEmotionSsrAdvancedApproach({key: 'css'});
export {withEmotionCache};

// setup wrapped app props
export type NextPageWithLayout = NextPage & {
  themeMode?: 'light' | 'dark';
};
export type WrappedAppProps = AppProps & {
  Component: NextPageWithLayout;
};

const WrappedApp = (props: WrappedAppProps) => {
  const {Component, pageProps} = props;
  const pageTheme = Component.themeMode === 'dark' ? darkTheme : lightTheme;

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

      <EmotionCacheProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={pageTheme}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline enableColorScheme />
            <TranslationProvider>
              <SnackbarProvider
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
              >
                <Web3ContextProvider>
                  <UnstoppableMessagingProvider>
                    <Component {...pageProps} />
                  </UnstoppableMessagingProvider>
                </Web3ContextProvider>
              </SnackbarProvider>
            </TranslationProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </EmotionCacheProvider>
    </>
  );
};

export default WrappedApp;
