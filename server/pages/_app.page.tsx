import type {Theme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Layout from 'components/app/Layout';
import type {NextPage} from 'next';
import {NextSeo} from 'next-seo';
import type {AppProps} from 'next/app';
import Head from 'next/head';
import React, {useEffect, useState} from 'react';
import 'react-medium-image-zoom/dist/styles.css';
import 'swiper/css/bundle';

import {
  BaseProvider,
  DomainConfigProvider,
  TokenGalleryProvider,
  UnstoppableMessagingProvider,
  getTheme,
  getThemeName,
} from '@unstoppabledomains/ui-components';
import type {
  ThemeMode,
  WalletType,
} from '@unstoppabledomains/ui-components/src/styles/theme/index';

// setup wrapped app props
export type NextPageWithLayout = NextPage & {
  themeMode?: ThemeMode;
};
export type WrappedAppProps = AppProps & {
  Component: NextPageWithLayout;
};

const WrappedApp = (props: WrappedAppProps) => {
  const {Component, pageProps} = props;
  const [themeName, setThemeName] = useState<WalletType>();
  const [themeMode, setThemeMode] = useState<ThemeMode>();
  const [pageTheme, setPageTheme] = useState<Theme>();
  const isDarkModeSystemDefault = useMediaQuery('(prefers-color-scheme: dark)');
  const themeModeKey = 'themeMode';

  // dynamically apply the page theme
  useEffect(() => {
    // retrieve the URL parameters
    const pagePath = window.location.href.toLowerCase();
    const pageQuery = window.location.search.toLowerCase();

    // set the theme name
    const name = getThemeName(pagePath + pageQuery);
    setThemeName(name);

    // initialize the theme mode
    const userDefinedMode = localStorage.getItem(themeModeKey);
    const mode =
      Component.themeMode ||
      (userDefinedMode
        ? userDefinedMode === 'dark' || pageQuery.includes('mode=dark')
          ? 'dark'
          : 'light'
        : isDarkModeSystemDefault
        ? 'dark'
        : 'light');
    setThemeMode(mode);

    // set the theme
    setPageTheme(getTheme(name, mode));
  }, [isDarkModeSystemDefault]);

  // dynamically set the page theme
  useEffect(() => {
    if (!themeName || !themeMode) {
      return;
    }
    localStorage.setItem(themeModeKey, themeMode);
    setPageTheme(getTheme(themeName, themeMode));
  }, [themeName, themeMode]);

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
      <NextSeo title="Unstoppable Domains" />
      <BaseProvider theme={pageTheme} mode={themeMode} setMode={setThemeMode}>
        <UnstoppableMessagingProvider>
          <TokenGalleryProvider>
            <DomainConfigProvider>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </DomainConfigProvider>
          </TokenGalleryProvider>
        </UnstoppableMessagingProvider>
      </BaseProvider>
    </>
  );
};

export default WrappedApp;
