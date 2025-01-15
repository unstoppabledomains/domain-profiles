import type {Theme} from '@mui/material/styles';

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
