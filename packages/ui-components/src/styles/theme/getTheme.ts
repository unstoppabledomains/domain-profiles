import type {Theme} from '@mui/material/styles';

import config from '@unstoppabledomains/config';

import type {ThemeMode, WalletType} from '.';
import {darkTheme as udmeDarkTheme, lightTheme as udmeLightTheme} from './udme';
import {darkTheme as upioDarkTheme, lightTheme as upioLightTheme} from './upio';

export const getTheme = (
  type: WalletType = 'udme',
  mode: ThemeMode = 'light',
): Theme => {
  switch (type) {
    case 'udme':
      if (mode === 'light') {
        return udmeLightTheme;
      }
      return udmeDarkTheme;
    case 'upio':
      if (mode === 'light') {
        return upioLightTheme;
      }
      return upioDarkTheme;
    default:
      throw new Error(`Invalid theme type: ${type}`);
  }
};

export const getThemeName = (urlString: string): WalletType => {
  // normalize the URL string
  const normalizedUrlString = urlString.toLowerCase();

  // determine the theme name based on the wallet type derived
  // from the page properties
  return normalizedUrlString.includes(config.UD_ME_BASE_URL) ||
    normalizedUrlString.includes('theme=udme')
    ? 'udme'
    : normalizedUrlString.includes(config.UP_IO_BASE_URL) ||
      normalizedUrlString.includes('theme=upio') ||
      normalizedUrlString.includes('/app')
    ? 'upio'
    : 'udme';
};
