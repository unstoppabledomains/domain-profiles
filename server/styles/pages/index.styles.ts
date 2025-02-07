import type {Theme} from '@mui/material/styles';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

type StyleProps = {
  isSaleActive?: boolean;
};

export const useStyles = makeStyles<
  StyleProps,
  'cardImageBottom' | 'cardImageTop'
>()((theme: Theme, {isSaleActive}, classes) => ({
  container: {
    position: 'relative',
    background: theme.palette.background.default,
    justifyContent: 'space-between',
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    height: '100%',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    height: '100%',
  },
  item: {
    justifyContent: 'center',
    display: 'flex',
  },
  button: {
    marginTop: theme.spacing(1),
  },
  searchContainer: {
    display: 'flex',
    zIndex: 102,
    flexDirection: 'column',
    maxWidth: '650px',
    width: '100%',
  },
  walletContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
    boxShadow: theme.shadows[6],
    minHeight: '405px',
    [theme.breakpoints.down('sm')]: {
      minHeight: '330px',
    },
  },
  walletInfoContainer: {
    width: '535px',
  },
  walletPortfolioContainer: {
    width: '420px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    height: '100%',
  },
  sectionTitle: {
    fontFamily: "'Helvetica Neue', sans-serif",
    fontWeight: 900,
    textAlign: 'center',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(7),
    [theme.breakpoints.down('sm')]: {
      marginBottom: theme.spacing(4),
    },
  },
  sectionSubTitle: {
    fontSize: 22,
    lineHeight: '36px',
    textAlign: 'center',
    color: theme.palette.neutralShades[600],
    marginBottom: theme.spacing(4),
    marginTop: theme.spacing(-4),
    [theme.breakpoints.down('sm')]: {
      fontSize: 18,
      lineHeight: '24px',
      marginTop: theme.spacing(-2),
    },
  },
  rightBlock: {
    position: 'relative',
    width: '100%',
    paddingTop: theme.spacing(2.5),
    zIndex: 1,
    maxWidth: 175,
    minHeight: 180,
    marginBottom: theme.spacing(8),
    transition: theme.transitions.create([
      'min-height, max-width, padding-top',
    ]),
    [theme.breakpoints.down('lg')]: {
      maxWidth: 175,
      minHeight: 180,
    },
    [theme.breakpoints.down('md')]: {
      maxWidth: 166,
      minHeight: 168,
      paddingTop: 0,
      marginBottom: theme.spacing(7),
    },
    [theme.breakpoints.down('sm')]: {
      maxWidth: 150,
      minHeight: 153,
      marginBottom: theme.spacing(6),
    },
    [`&:hover .${classes.cardImageBottom}`]: {
      transform: 'matrix(1, 0, 0, 1, 0, 0)',
      right: '21%',
      bottom: 0,
      zIndex: 0,
    },
    [`&:hover .${classes.cardImageTop}`]: {
      bottom: '-21%',
      right: '10%',
      zIndex: -1,
      transform: 'matrix(0.99, 0.14, -0.14, 0.99, 0, 0)',
    },
  },
  cardImage: {
    display: 'flex',
    width: '100%',
    maxWidth: 150,
    borderRadius: 16,
    boxShadow:
      '0px 2px 3px rgba(0, 0, 0, 0.07), 0px 6px 6px rgba(0, 0, 0, 0.04), 0px 12px 12px rgba(0, 0, 0, 0.03), 0px 20px 24px rgba(0, 0, 0, 0.03), 0px 32px 40px rgba(0, 0, 0, 0.02), 0px 80px 100px rgba(0, 0, 0, 0.16), 0px 0px 4px rgba(0, 0, 0, 0.08), 0px 8px 48px rgba(0, 0, 0, 0.08)',
    '& img': {
      objectFit: 'cover',
    },
    transition: theme.transitions.create(
      ['transform', 'right', 'bottom', 'z-index'],
      {
        duration: 850,
      },
    ),
    [theme.breakpoints.down('lg')]: {
      maxWidth: 150,
    },
    [theme.breakpoints.down('md')]: {
      maxWidth: 132,
    },
    [theme.breakpoints.down('sm')]: {
      maxWidth: 120,
    },
  },
  cardImageTop: {
    position: 'absolute',
    bottom: 0,
    right: '21%',
    zIndex: 0,
  },
  cardImageBottom: {
    position: 'absolute',
    bottom: '-21%',
    right: '10%',
    zIndex: -1,
    transform: 'matrix(0.99, 0.14, -0.14, 0.99, 0, 0)',
    [theme.breakpoints.down('lg')]: {
      right: '5%',
    },
    [theme.breakpoints.down('md')]: {
      right: 0,
    },
  },
  footerContainer: {
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    justifyContent: 'center',
    marginTop: theme.spacing(5),
  },
  footerContent: {
    display: 'flex',
    justifyContent: 'center',
  },
  footerLink: {
    marginRight: theme.spacing(1),
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.neutralShades[600],
    cursor: 'pointer',
    wordBreak: 'normal',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  copyright: {
    color: theme.palette.neutralShades[600],
  },
  manageContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '520px',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  manageIcon: {
    width: '30px',
    height: '30px',
  },
  manageTitle: {
    display: 'flex',
    width: '100%',
    color: theme.palette.getContrastText(theme.palette.background.default),
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(-6),
  },
  upperContainer: {
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    overflowX: 'hidden',
    width: '100%',
    maxHeight: '520px',
    textAlign: 'center',
  },
  lowerContainer: {
    display: 'flex',
    marginTop: theme.spacing(1),
    width: '100%',
    [theme.breakpoints.down('md')]: {
      marginRight: theme.spacing(3),
    },
  },
  errorIcon: {
    color: theme.palette.error.main,
    height: '55px',
    width: '55px',
  },
  successIcon: {
    color: theme.palette.success.main,
    height: '55px',
    width: '55px',
  },
}));
