import Document, {Head, Html, Main, NextScript} from 'next/document';
import React from 'react';

import config from '@unstoppabledomains/config';
import {
  getImageUrl,
  getThemeName,
  withEmotionCache,
} from '@unstoppabledomains/ui-components';
import theme from '@unstoppabledomains/ui-kit/styles';

class MyDocument extends Document {
  render() {
    // retrieve the theme name from the document properties
    const themeName = getThemeName(this.props.__NEXT_DATA__.page);

    // determine the favicon based on the theme name
    const legacyFavIcon = getImageUrl(
      themeName === 'upio'
        ? '/upio/favicon/beta.ico'
        : '/favicon/favicon-v3.ico',
    );
    const appleFavIcon = getImageUrl(
      themeName === 'upio'
        ? '/upio/favicon/beta-apple-touch-icon.png'
        : '/favicon/apple-touch-icon.png',
    );
    const svgFavIcon = getImageUrl(
      themeName === 'upio' ? '/upio/favicon/beta.svg' : '/favicon/icon.svg',
    );

    // render the base document
    return (
      <Html>
        <Head>
          {/*
            Preconnect allows the browser to setup early connections before an HTTP request
            is actually sent to the server.
            This includes DNS lookups, TLS negotiations, TCP handshakes.
          */}
          <link
            rel="preconnect"
            href={config.ASSETS_BUCKET_URL}
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            as="font"
            href={`${config.ASSETS_BUCKET_URL}/fonts/HelveticaNeueLT97BlackCondensed.ttf`}
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            as="font"
            href={`${config.ASSETS_BUCKET_URL}/fonts/Inter.woff2`}
            crossOrigin="anonymous"
          />
          {/* Legacy favicon without transparent pixels, to fix transparency issues */}
          <link rel="icon" href={legacyFavIcon} sizes="any" />
          {/* Responsive, future-proof SVG favicon, supports dark/light themes */}
          <link rel="icon" type="image/svg+xml" href={svgFavIcon} />
          {/* 3072x3072 iOS friendly icon */}
          <link rel="apple-touch-icon" href={appleFavIcon} />
          <meta httpEquiv="Content-type" content="text/html" charSet="UTF-8" />
          <meta name="theme-color" content={theme.palette.background.default} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default withEmotionCache(MyDocument);
