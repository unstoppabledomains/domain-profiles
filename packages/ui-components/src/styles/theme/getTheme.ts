import type {Theme} from '@mui/material/styles';

import {darkTheme as udmeDarkTheme, lightTheme as udmeLightTheme} from './udme';
import {darkTheme as upioDarkTheme, lightTheme as upioLightTheme} from './upio';

export const getTheme = (
  name: 'udme' | 'upio' = 'udme',
  mode: 'light' | 'dark' = 'light',
): Theme => {
  switch (name) {
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
      throw new Error(`Invalid theme name: ${name}`);
  }
};
