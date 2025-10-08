import type {Theme} from '@mui/material/styles';

import {
  PROFILE_PICTURE_SIZE_DESKTOP,
  PROFILE_PICTURE_SIZE_MOBILE,
} from '@unstoppabledomains/ui-components';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    background: theme.palette.background.default,
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    paddingBottom: theme.spacing(16),
  },
  content: {
    ...theme.containers.main,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      marginTop: 0,
    },
  },
  item: {
    [theme.breakpoints.down('sm')]: {
      paddingTop: theme.spacing(2),
    },
    '&:first-of-type': {
      paddingRight: theme.spacing(4),
      [theme.breakpoints.down('md')]: {
        paddingRight: 0,
      },
    },
  },
  headWrapper: {
    position: 'relative',
    backgroundColor: '#192B55',
    height: 148,
    [theme.breakpoints.up('md')]: {
      height: 200,
    },
  },
  head: {
    ...theme.containers.main,
    backgroundColor: 'initial',
    position: 'relative',
    height: '100%',
    zIndex: 1,
    [theme.breakpoints.down('md')]: {
      marginTop: 0,
    },
  },
  headWrapperWithCover: {
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: theme.palette.greyShades[900],
      opacity: 0.24,
    },
  },
  logo: {
    position: 'absolute',
    left: theme.spacing(4),
    top: theme.spacing(1),
    zIndex: 2,
    [theme.breakpoints.down('sm')]: {
      left: theme.spacing(2),
    },
  },
  headerContainer: {
    [theme.breakpoints.down('md')]: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
  },
  badgeCaption: {
    width: 'fit-content',
    fontWeight: 700,
    fontSize: 14,
    textTransform: 'uppercase',
    background: theme.palette.neutralShades[200],
    color: theme.palette.getContrastText(theme.palette.background.default),
    padding: '2px 6px',
    borderRadius: '4px',
    marginBottom: theme.spacing(2),
  },
  profilePicture: {
    display: 'flex',
    justifyContent: 'center',
    zIndex: 0,
    height: PROFILE_PICTURE_SIZE_MOBILE,
    [theme.breakpoints.up('sm')]: {
      height: PROFILE_PICTURE_SIZE_DESKTOP,
    },
    [theme.breakpoints.up('md')]: {
      justifyContent: 'flex-start',
    },
  },
  leftPanel: {
    marginTop: -(PROFILE_PICTURE_SIZE_MOBILE / 2 + 16),
    textAlign: 'center',
    [theme.breakpoints.up('sm')]: {
      marginTop: -(PROFILE_PICTURE_SIZE_MOBILE / 2),
    },
    [theme.breakpoints.up('md')]: {
      marginTop: -(PROFILE_PICTURE_SIZE_DESKTOP / 2),
      textAlign: 'initial',
    },
  },
  badgeHeader: {
    margin: theme.spacing(6, 0, 2),
  },
  getBadgeButton: {marginTop: theme.spacing(2)},
  showMore: {
    color: theme.palette.primary.main,
    cursor: 'pointer',
    fontWeight: 600,
  },
  copyIconButton: {
    width: 32,
    height: 32,
  },
  copyIcon: {
    fontSize: 20,
  },
  infoIcon: {
    marginLeft: theme.spacing(1),
    color: theme.palette.neutralShades[200],
  },
  displayName: {
    wordBreak: 'break-word',
    fontSize: '2rem',
    lineHeight: 1.25,
  },
  sidebarIcon: {
    marginRight: theme.spacing(1.5),
    fill: theme.palette.greyShades[900],
  },
  websiteLink: {
    fontSize: theme.typography.body1.fontSize,
    lineHeight: 1.5,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.greyShades[900],
    transition: theme.transitions.create('color'),
    '&:hover': {
      textDecoration: 'none',
      color: theme.palette.primary.main,
    },
  },
  divider: {margin: theme.spacing(3, 0)},
  profileButtonContainer: {
    position: 'absolute',
    right: theme.spacing(2),
    top: theme.spacing(1),
    display: 'flex',
    zIndex: 2,
  },
  shareMenuContainer: {
    position: 'absolute',
    right: theme.spacing(1),
    bottom: theme.spacing(1),
    color: theme.palette.background.default,
  },
  shareMenu: {
    color: theme.palette.background.default,
  },
  description: {
    fontSize: theme.typography.body1.fontSize,
    lineHeight: 1.5,
  },
  footer: {
    ...theme.containers.main,
    maxWidth: 1256,
    padding: theme.spacing(0, 2.5),
    [theme.breakpoints.down('md')]: {
      margin: 0,
    },
  },
  badgeListContainer: {
    marginTop: `${theme.spacing(5)} !important`,
  },
  contentLabel: {
    marginBottom: theme.spacing(3),
    fontWeight: 700,
    fontSize: '20px !important',
    display: 'flex',
    alignItems: 'center',
  },
  helpIcon: {
    marginLeft: theme.spacing(1),
    color: theme.palette.neutralShades[600],
  },
  contentContainer: {
    height: 400,
    boxShadow: '0px 1px 0px #DDDDDF, 0px 0px 0px 1px #DDDDDF',
    borderRadius: 8,
    padding: theme.spacing(2),
  },
  showMoreButton: {width: '100%', marginTop: theme.spacing(2)},
  videoContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  video: {
    maxHeight: 437,
    maxWidth: '16em',
    marginTop: 57,
    [theme.breakpoints.down('md')]: {
      marginTop: 0,
      maxWidth: '100%',
      maxHeight: '50%',
    },
    [theme.breakpoints.down('sm')]: {
      maxHeight: 437,
    },
  },
}));

export default useStyles;
