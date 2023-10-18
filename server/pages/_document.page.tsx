import getImageUrl from 'lib/domain/getImageUrl';
import Document, {Head, Html, Main, NextScript} from 'next/document';
import {withEmotionCache} from 'pages/_app.page';
import React from 'react';

import theme from '@unstoppabledomains/ui-kit/styles';

class MyDocument extends Document {
  render() {
    const shortcutIcon = getImageUrl('/favicon/favicon-v3.ico');
    const svgFavicon = getImageUrl('/favicon/icon.svg');
    const appleTouchIcon = getImageUrl('/favicon/apple-touch-icon.png');
    return (
      <Html>
        <Head>
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
}

export default withEmotionCache(MyDocument);
