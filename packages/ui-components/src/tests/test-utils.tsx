import type {Theme} from '@mui/material/styles';
import {ThemeProvider} from '@mui/material/styles';
import type {RenderResult} from '@testing-library/react';
import {render} from '@testing-library/react';
import type {NextRouter} from 'next/router';
import * as nextRouter from 'next/router';
import {SnackbarProvider} from 'notistack';
import type {ReactElement} from 'react';
import React from 'react';
import {QueryClient, QueryClientProvider} from 'react-query';

import defaultTheme from '@unstoppabledomains/ui-kit/styles';

import * as actions from '../actions';
import {TranslationProvider} from '../lib';
import {
  DomainConfigProvider,
  EmotionCacheProvider,
  TokenGalleryProvider,
  UnstoppableMessagingProvider,
  Web3ContextProvider,
} from '../providers';

// Instantiate query client for each render so that we do not leak state between tests
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: Infinity,
      },
    },
  });

// test class to wrap test components with required providers
const createWrapper =
  ({theme}: {theme?: Theme} = {}): React.FC =>
  ({children}) => (
    <QueryClientProvider client={createTestQueryClient()}>
      <EmotionCacheProvider>
        <ThemeProvider theme={theme || defaultTheme}>
          <SnackbarProvider>
            <Web3ContextProvider>
              <TokenGalleryProvider>
                <UnstoppableMessagingProvider>
                  <DomainConfigProvider>
                    <TranslationProvider>{children}</TranslationProvider>
                  </DomainConfigProvider>
                </UnstoppableMessagingProvider>
              </TokenGalleryProvider>
            </Web3ContextProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </EmotionCacheProvider>
    </QueryClientProvider>
  );

export const createMockRouter = (
  overrides: Partial<NextRouter> = {},
): NextRouter => ({
  basePath: '',
  pathname: '/',
  route: '/',
  asPath: '/',
  query: {},
  push: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn(),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
  ...overrides,
});

// renders a child component with required wrappers
export const customRender = (
  ui: ReactElement,
  theme?: Theme,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any,
  mockFlagsData?: unknown,
): RenderResult => {
  // mock feature flag data if requested
  if (mockFlagsData) {
    (jest.spyOn(actions, 'useFeatureFlags') as jest.Mock).mockImplementation(
      () => ({
        data: mockFlagsData ?? {},
      }),
    );
  }

  // mock the next router
  jest.spyOn(nextRouter, 'useRouter').mockImplementation(() =>
    createMockRouter({
      pathname: '/',
    }),
  );

  // render the test component
  return render(ui, {
    wrapper: createWrapper({theme}),
    ...options,
  });
};

// override render method
export {customRender as render};
