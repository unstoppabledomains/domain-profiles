import type {Theme, ThemeOptions} from '@mui/material/styles';
import {
  createTheme,
  darken,
  lighten,
  responsiveFontSizes,
} from '@mui/material/styles';

import type {ThemeMode} from '../index';
import {THEME_SHAPE_BORDER_RADIUS} from '../index';

// all primary colors should use darken() and lighten() based upon the
// following base colors
const PRIMARY_BASE_COLOR = '#00c742';
const PRIMARY_SUCCESS_COLOR = '#00c742';

// more info on dark mode: https://mui.com/material-ui/customization/dark-mode/
const buildThemeOptions = (mode: ThemeMode): ThemeOptions => ({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    fontWeightMedium: 600,
    h1: {
      fontWeight: 700,
      fontSize: '4.25rem',
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
    button: {
      textTransform: 'none',
    },
  },
  containers: {
    main: {
      marginLeft: 'auto',
      marginRight: 'auto',
      paddingLeft: 8 * 2.5,
      paddingRight: 8 * 2.5,
      width: '100%',
      backgroundColor: 'inherit',
      maxWidth: 1256,
    },
    box: {
      marginTop: 16,
      marginBottom: 16,
      paddingTop: 8,
      paddingLeft: 16,
      paddingRight: 16,
      borderRadius: THEME_SHAPE_BORDER_RADIUS * 0.75,
    },
    navigationBox: {
      backgroundColor: mode === 'dark' ? '#121212' : '#fff',
      border: '1px solid #e2e4ec',
      borderRadius: THEME_SHAPE_BORDER_RADIUS,
    },
    card: {
      backgroundColor: mode === 'dark' ? '#121212' : '#fff',
      borderRadius: THEME_SHAPE_BORDER_RADIUS * 4,
      padding: 16,
      boxShadow:
        '0 1px 2px rgba(0, 0, 0, 0.1), 0 64px 80px rgba(150, 143, 186, 0.16)',
      boxSizing: 'border-box',
    },
    panel: {
      backgroundColor: mode === 'dark' ? '#121212' : '#fff',
      borderRadius: THEME_SHAPE_BORDER_RADIUS,
      padding: 8,
      boxShadow: 'inset 0 0 0 1px #E2E4EC',
      boxSizing: 'border-box',
    },
    modalContent: {
      minWidth: 480,
      width: '100%',
    },
  },
  wallet: {
    type: 'upio',
    title: 'UP.io',
    titleShort: 'Up.io',
    subTitle: 'Watch your crypto grow up.',
  },
  palette: {
    mode,
    error: {
      main: mode === 'dark' ? '#ef554a' : '#B72015',
    },
    link: {main: '#0D67FE'},
    iceBlue: {main: '#E6F6FF', dark: '#ceedff'},
    yellow: {main: '#ffefb7'},
    cloudyBlue: {main: 'rgba(190, 195, 220, 0.1)'},
    purple: {main: '#797ff2'},
    nightBlue: {main: '#061543'},
    primary: {
      main: PRIMARY_BASE_COLOR,
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#454545',
    },
    success: {
      main: PRIMARY_SUCCESS_COLOR,
      contrastText: '#ffffff',
    },
    background: {
      default: mode === 'dark' ? '#121212' : '#F5F5F5',
      paper: mode === 'dark' ? '#323232' : '#ffffff',
    },
    backgroundWithAlpha: {
      default: alpha =>
        mode === 'dark'
          ? `rgba(12,12,12,${alpha})`
          : `rgba(255,255,255,${alpha})`,
    },
    white: '#ffffff',
    hero: `linear-gradient(75deg, ${darken(PRIMARY_BASE_COLOR, 0.2)}, ${darken(
      PRIMARY_BASE_COLOR,
      0.4,
    )}, ${darken(PRIMARY_BASE_COLOR, 0.5)})`,
    heroText: `linear-gradient(30deg, ${darken(
      PRIMARY_BASE_COLOR,
      mode === 'dark' ? 0.95 : 0.85,
    )}, ${darken(PRIMARY_BASE_COLOR, mode === 'dark' ? 0.55 : 0.45)}, ${
      mode === 'dark'
        ? darken(PRIMARY_BASE_COLOR, 0.15)
        : lighten(PRIMARY_BASE_COLOR, 0.3)
    })`,
    profileImageGradient: `linear-gradient(45deg, ${darken(
      PRIMARY_BASE_COLOR,
      0.2,
    )} 0%, ${darken(PRIMARY_BASE_COLOR, 0.4)} 52.08%, ${darken(
      PRIMARY_BASE_COLOR,
      0.5,
    )} 100%)`,
    mobileNavGradient:
      'linear-gradient(272deg, #F5F5F5 25%, rgba(249, 250, 255, 0) 100%)',
    pressedPaper: '#F3F4FB',
    primaryShades: {
      100: lighten(PRIMARY_BASE_COLOR, 0.4),
      200: lighten(PRIMARY_BASE_COLOR, 0.3),
      300: lighten(PRIMARY_BASE_COLOR, 0.2),
      400: lighten(PRIMARY_BASE_COLOR, 0.1),
      500: PRIMARY_BASE_COLOR,
      600: darken(PRIMARY_BASE_COLOR, 0.1),
      700: darken(PRIMARY_BASE_COLOR, 0.2),
      800: darken(PRIMARY_BASE_COLOR, 0.3),
      900: darken(PRIMARY_BASE_COLOR, 0.4),
    },
    blueGreyShades: {
      25: '#F9FAFF',
      50: '#F1F2F9',
      75: '#E4E5EA',
      100: '#D8DAE6',
      200: '#B7B7C3',
      400: '#6C6C7E',
      500: '#464652',
      600: '#35353D',
    },
    greyShades: {
      25: '#F9FAFF',
      50: '#F1F1F3',
      75: '#DBDCE1',
      100: '#CDCED5',
      200: '#BABAC4',
      300: '#9191A1',
      400: '#5E5E6E',
      500: '#94949E',
      600: '#62626A',
      700: '#2F2F37',
      900: '#000000',
    },
    successShades: {
      100: lighten(PRIMARY_SUCCESS_COLOR, 0.45),
      200: lighten(PRIMARY_SUCCESS_COLOR, 0.4),
      300: lighten(PRIMARY_SUCCESS_COLOR, 0.35),
      400: lighten(PRIMARY_SUCCESS_COLOR, 0.3),
      500: PRIMARY_SUCCESS_COLOR,
      600: darken(PRIMARY_SUCCESS_COLOR, 0.1),
      700: darken(PRIMARY_SUCCESS_COLOR, 0.2),
      900: darken(PRIMARY_SUCCESS_COLOR, 0.4),
    },
    warningShades: {
      100: '#FEF9E1',
      200: '#FEF5E7',
      300: '#EAE2D5',
      600: '#D18411',
      700: '#AE6E0E',
      900: '#663B07',
    },
    dangerShades: {
      50: '#FEF1F0',
      75: '#EADEDD',
      100: '#FAEDEB',
      200: '#F8CAC3',
      300: '#E6C6C4',
      500: '#EB3223',
      600: '#E72113',
      700: '#BD1B0F',
      900: '#591F19',
    },
    neutralShades: {
      50: '#F5F5F5',
      75: '#F0F0F1',
      100: '#EDEDEE',
      150: '#DCDDE1',
      200: '#DDDDDF',
      300: '#C8C8CB',
      400: '#AFAFB6',
      500: '#7A7A85',
      600: '#62626A',
      700: '#4A4A4F',
      800: '#323234',
    },
    wallet:
      mode === 'dark'
        ? {
            background: {
              main: '#323232',
              gradient: {
                start: '#121212',
                end: '#323232',
              },
            },
            card: {
              text: '#eeeeee',
              selected: {
                background: '#323232',
                text: '#eeeeee',
              },
              gradient: {
                start: '#121212',
                end: '#323232',
              },
            },
            text: {
              primary: '#eeeeee',
              secondary: '#979797',
            },
            chart: {
              up: PRIMARY_BASE_COLOR,
              down: '#9f9fa7',
            },
          }
        : {
            background: {
              main: '#fafafa',
              gradient: {
                start: '#fafafa',
                end: '#ffffff',
              },
            },
            card: {
              text: '#606060',
              selected: {
                background: '#fafafa',
                text: '#606060',
              },
              gradient: {
                start: '#dedede',
                end: '#f0f0f0',
              },
            },
            text: {
              primary: '#606060',
              secondary: '#979797',
            },
            chart: {
              up: PRIMARY_BASE_COLOR,
              down: '#9f9fa7',
            },
          },
  },
  shape: {
    borderRadius: THEME_SHAPE_BORDER_RADIUS,
  },
  MuiDataGrid: {
    root: {
      fontSize: '0.8rem',
    },
    colCellTitle: {
      fontWeight: 'bold',
    },
  },
});

// global components styles overrides
const addThemeOverrides = (theme: Theme) => {
  /* eslint-disable no-param-reassign */
  theme.components = {
    MuiTooltip: {
      defaultProps: {
        enterTouchDelay: 0,
      },
    },
    MuiTabs: {
      defaultProps: {
        textColor: 'primary',
        indicatorColor: 'primary',
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          margin: 8,
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          wordBreak: 'break-word',
        },
        h5: {
          fontWeight: 700,
          [theme.breakpoints.down('sm')]: {
            fontSize: '1.25rem',
          },
        },
        h6: {
          [theme.breakpoints.up('xs')]: {
            fontSize: '1.125rem',
            lineHeight: 1.5,
          },
        },
        body1: {
          [theme.breakpoints.down('sm')]: {
            fontSize: '0.875rem',
          },
        },
        body2: {
          [theme.breakpoints.down('sm')]: {
            fontSize: '0.825rem',
          },
        },
        subtitle2: {
          lineHeight: 1.45,
        },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        label: {
          fontSize: '1rem',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: theme.typography.fontWeightBold,
          fontSize: theme.typography.body1.fontSize,
          wordBreak: 'normal',
        },
        outlinedInherit: {
          borderColor: theme.palette.neutralShades[300],
          color: theme.palette.greyShades[900],
        },
        sizeLarge: {
          padding: theme.spacing(0.625, 2),
          minHeight: 40,
        },
        sizeSmall: {
          fontSize: theme.typography.body2.fontSize,
          paddingBottom: theme.spacing(0.85),
          paddingTop: theme.spacing(0.85),
          minHeight: 40,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          [theme.breakpoints.down('md')]: {
            fontSize: theme.typography.fontSize,
          },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          [theme.breakpoints.down('md')]: {
            fontSize: theme.typography.fontSize,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          [theme.breakpoints.down('md')]: {
            margin: theme.spacing(1.5),
          },
        },
        paperScrollPaper: {
          [theme.breakpoints.down('md')]: {
            width: `calc(100% - ${theme.spacing(3)})`,
          },
        },
        paperFullWidth: {
          [theme.breakpoints.down('md')]: {
            width: `calc(100% - ${theme.spacing(3)})`,
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
        standardError: {
          background: theme.palette.dangerShades[100],
          color: theme.palette.dangerShades[900],
          border: '1px solid rgba(0 0 0 / 8%)',
          '& .MuiAlert-icon': {
            color: theme.palette.dangerShades[700],
          },
        },
      },
    },
    MuiAlertTitle: {
      styleOverrides: {
        root: {
          fontSize: theme.typography.body1.fontSize,
          marginBottom: 0,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          paddingLeft: 0,
          paddingRight: 0,
          textTransform: 'none',
          fontSize: theme.typography.body1.fontSize,
          marginRight: theme.spacing(4),
          [theme.breakpoints.up('xs')]: {
            minWidth: 'auto',
          },
          [theme.breakpoints.down('md')]: {
            fontSize: theme.typography.body2.fontSize,
          },
        },
      },
    },
    MuiImageListItemBar: {
      styleOverrides: {
        title: {
          color: theme.palette.getContrastText(
            theme.palette.background.default,
          ),
          fontWeight: theme.typography.fontWeightBold,
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        root: {
          wordBreak: 'normal',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: `0px 0px 0px 1px ${theme.palette.greyShades[75]}`,
        },
      },
    },
  };

  if (theme.palette.mode === 'light' && theme.components) {
    theme.components.MuiCard = {
      styleOverrides: {
        root: {
          '&.MuiPaper-elevation0': {
            border: 'solid 1px #DDDDDF',
          },
        },
      },
    };
  }

  if (theme.palette.mode === 'dark' && theme.components) {
    theme.components.MuiPaper = {
      styleOverrides: {
        root: {
          border: `1px solid ${theme.palette.neutralShades[700]}`,
        },
      },
    };
  }

  /* eslint-disable @typescript-eslint/ban-ts-comment */

  // @ts-ignore
  theme.containers.main[theme.breakpoints.down('md')] = {
    marginTop: theme.spacing(2),
  };

  // @ts-ignore
  theme.containers.modalContent[theme.breakpoints.down('md')] = {
    minWidth: 0,
  };

  /* eslint-enable no-param-reassign, @typescript-eslint/ban-ts-comment */

  return responsiveFontSizes(theme);
};

export const darkTheme = addThemeOverrides(
  createTheme(buildThemeOptions('dark')),
);

export const lightTheme = addThemeOverrides(
  createTheme(buildThemeOptions('light')),
);

export default lightTheme;
