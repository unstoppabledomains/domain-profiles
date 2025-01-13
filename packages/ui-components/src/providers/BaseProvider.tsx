import CssBaseline from '@mui/material/CssBaseline';
import type {Theme} from '@mui/material/styles';
import {ThemeProvider} from '@mui/material/styles';
import {SnackbarProvider} from 'notistack';
import React from 'react';
import {QueryClient, QueryClientProvider} from 'react-query';
import {createEmotionSsrAdvancedApproach} from 'tss-react/nextJs';

import {TranslationProvider} from '../lib';
import {lightTheme} from '../styles/theme/udme';
import Web3ContextProvider from './Web3ContextProvider';

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
export const {EmotionCacheProvider, withEmotionCache} =
  createEmotionSsrAdvancedApproach({key: 'css'});

type Props = {
  children: React.ReactNode;
  theme?: Theme;
};

const BaseProvider: React.FC<Props> = ({children, theme = lightTheme}) => {
  return (
    <TranslationProvider>
      <EmotionCacheProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline enableColorScheme />
            <SnackbarProvider
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
            >
              <Web3ContextProvider>{children}</Web3ContextProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </EmotionCacheProvider>
    </TranslationProvider>
  );
};

export default BaseProvider;
