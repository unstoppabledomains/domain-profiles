import type {DocumentHeadTagsProps} from '@mui/material-nextjs/v14-pagesRouter';
import {
  DocumentHeadTags,
  documentGetInitialProps,
} from '@mui/material-nextjs/v14-pagesRouter';
import type {DocumentContext, DocumentProps} from 'next/document';
import {Head, Html, Main, NextScript} from 'next/document';
import React from 'react';

import config from '@unstoppabledomains/config';
import {getImageUrl} from '@unstoppabledomains/ui-components';
import theme from '@unstoppabledomains/ui-kit/styles';

export default function MyDocument(
  props: DocumentProps & DocumentHeadTagsProps,
) {
  const shortcutIcon = getImageUrl('/favicon/favicon-v3.ico');
  const svgFavicon = getImageUrl('/favicon/icon.svg');
  const appleTouchIcon = getImageUrl('/favicon/apple-touch-icon.png');
  return (
    <Html>
      <Head>
        <DocumentHeadTags {...props} />
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
        <link rel="icon" href={shortcutIcon} sizes="any" />
        {/* Responsive, future-proof SVG favicon, supports dark/light themes */}
        <link rel="icon" type="image/svg+xml" href={svgFavicon} />
        {/* 3072x3072 iOS friendly icon */}
        <link rel="apple-touch-icon" href={appleTouchIcon} />
        <meta httpEquiv="Content-type" content="text/html" charSet="UTF-8" />
        <meta name="theme-color" content={theme.palette.common.white} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

MyDocument.getInitialProps = async (ctx: DocumentContext) => {
  const finalProps = await documentGetInitialProps(ctx);
  return finalProps;
};
