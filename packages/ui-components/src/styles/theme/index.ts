import type {SimplePaletteColorOptions} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';

// Add custom styles to theme properties
declare module '@mui/material/styles' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-shadow
  interface Theme extends ThemeExtends {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-shadow
  interface ThemeOptions extends ThemeExtends {}
}

// Add custom colors to palette properties
declare module '@mui/material/styles/createPalette' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Palette extends PaletteExtends {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface PaletteOptions extends PaletteExtends {}
}

export type BackgroundWithAlpha = (
  alpha: number,
) => React.CSSProperties['backgroundColor'];

export type BackgroundsWithAlpha = {
  default: BackgroundWithAlpha;
};

export type BlueGreyShades = {
  25: string;
  50: string;
  75: string;
  100: string;
  200: string;
  400: string;
  500: string;
  600: string;
};

export type DangerShades = {
  50: string;
  75: string;
  100: string;
  200: string;
  300: string;
  500: string;
  600: string;
  700: string;
  900: string;
};

export type GreyShades = {
  25: string;
  50: string;
  75: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  900: string;
};

export type NeutralShades = {
  50: string;
  75: string;
  100: string;
  150: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
};

export interface PaletteExtends {
  link: SimplePaletteColorOptions;
  iceBlue: SimplePaletteColorOptions;
  yellow: SimplePaletteColorOptions;
  cloudyBlue: SimplePaletteColorOptions;
  purple: SimplePaletteColorOptions;
  nightBlue: SimplePaletteColorOptions;
  white: string;
  hero: React.CSSProperties['background'];
  heroText: React.CSSProperties['background'];
  profileImageGradient: React.CSSProperties['background'];
  mobileNavGradient: React.CSSProperties['background'];
  pressedPaper: React.CSSProperties['backgroundColor'];
  primaryShades: PrimaryShades;
  blueGreyShades: BlueGreyShades;
  greyShades: GreyShades;
  successShades: SuccessShades;
  warningShades: WarningShades;
  dangerShades: DangerShades;
  neutralShades: NeutralShades;
  wallet: WalletPalette;
  mode: 'light' | 'dark';
  backgroundWithAlpha: BackgroundsWithAlpha;
}

export type PrimaryShades = {
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
};

export type SuccessShades = {
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  900: string;
};

export const THEME_SHAPE_BORDER_RADIUS = 8;

export interface ThemeExtends {
  containers: {
    main: {
      marginLeft: React.CSSProperties['margin'];
      marginRight: React.CSSProperties['margin'];
      paddingLeft: React.CSSProperties['padding'];
      paddingRight: React.CSSProperties['padding'];
      width: React.CSSProperties['width'];
      maxWidth: React.CSSProperties['width'];
      backgroundColor: React.CSSProperties['backgroundColor'];
    };
    box: {
      marginTop: React.CSSProperties['margin'];
      marginBottom: React.CSSProperties['margin'];
      paddingTop: React.CSSProperties['padding'];
      paddingLeft: React.CSSProperties['padding'];
      paddingRight: React.CSSProperties['padding'];
      borderRadius: React.CSSProperties['borderRadius'];
    };
    navigationBox: {
      backgroundColor: React.CSSProperties['backgroundColor'];
      border: React.CSSProperties['border'];
      borderRadius: React.CSSProperties['borderRadius'];
    };
    card: {
      backgroundColor: React.CSSProperties['backgroundColor'];
      borderRadius: React.CSSProperties['borderRadius'];
      padding: React.CSSProperties['padding'];
      boxShadow: React.CSSProperties['boxShadow'];
      boxSizing: React.CSSProperties['boxSizing'];
    };
    panel: {
      backgroundColor: React.CSSProperties['backgroundColor'];
      borderRadius: React.CSSProperties['borderRadius'];
      padding: React.CSSProperties['padding'];
      boxShadow: React.CSSProperties['boxShadow'];
      boxSizing: React.CSSProperties['boxSizing'];
    };
    modalContent: {
      minWidth: React.CSSProperties['width'];
      width: React.CSSProperties['width'];
    };
  };
  MuiDataGrid: {
    root: {
      fontSize: React.CSSProperties['fontSize'];
    };
    colCellTitle: {
      fontWeight: React.CSSProperties['fontWeight'];
    };
  };
}

export interface WalletPalette {
  background: {
    main: string;
    gradient: {
      start: string;
      end: string;
    };
  };
  card: {
    text: string;
    gradient: {
      start: string;
      end: string;
    };
    selected: {
      background: string;
      text: string;
    };
  };
  text: {
    primary: string;
    secondary: string;
  };
  chart: {
    up: string;
    down: string;
  };
  buttonStyle: 'contained' | 'outlined' | 'text';
  product: {
    logoType: 'udme' | 'upio';
    title: string;
    titleShort: string;
    subTitle: string;
  };
}

export type WarningShades = {
  100: string;
  200: string;
  300: string;
  600: string;
  700: string;
  900: string;
};

export const useCustomTheme = useTheme;
