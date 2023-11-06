import CssBaseline from '@mui/material/CssBaseline';
import {ThemeProvider} from '@mui/material/styles';
import {SnackbarProvider} from 'notistack';
import React from 'react';
import {QueryClient, QueryClientProvider} from 'react-query';
import {createEmotionSsrAdvancedApproach} from 'tss-react/nextJs';

import {lightTheme} from '@unstoppabledomains/ui-kit/styles';

import {TranslationProvider} from '../lib';
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
const {EmotionCacheProvider, withEmotionCache} =
  createEmotionSsrAdvancedApproach({key: 'css'});
export {withEmotionCache};

type Props = {
  children: React.ReactNode;
};

const BaseProvider: React.FC<Props> = ({children}) => {
  return (
    <TranslationProvider>
      <EmotionCacheProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={lightTheme}>
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
