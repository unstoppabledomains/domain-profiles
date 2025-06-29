import type {Theme} from '@mui/material/styles';

import {
  PROFILE_PICTURE_SIZE_DESKTOP,
  PROFILE_PICTURE_SIZE_MOBILE,
} from '@unstoppabledomains/ui-components';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

export const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    background: theme.palette.background.default,
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
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
    backgroundColor: theme.palette.primaryShades[900],
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
    zIndex: 101,
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
    zIndex: 102,
    [theme.breakpoints.down('sm')]: {
      left: theme.spacing(2),
    },
  },
  emptyProfilePicture: {
    display: 'flex',
    justifyContent: 'center',
    zIndex: 100,
    height: PROFILE_PICTURE_SIZE_MOBILE / 2,
    [theme.breakpoints.up('sm')]: {
      height: PROFILE_PICTURE_SIZE_DESKTOP / 2 + 11,
    },
    [theme.breakpoints.up('md')]: {
      justifyContent: 'flex-start',
    },
  },
  profilePicture: {
    display: 'flex',
    justifyContent: 'center',
    zIndex: 100,
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
  loadingContainer: {
    marginLeft: theme.spacing(28),
    marginTop: theme.spacing(10),
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(0),
      marginTop: theme.spacing(2),
      display: 'flex',
      justifyContent: 'center',
    },
  },
  loadingSpinner: {
    color: theme.palette.secondary.main,
  },
  headerIcon: {
    color: theme.palette.getContrastText(theme.palette.background.default),
    marginRight: theme.spacing(1),
  },
  sectionHeaderContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    verticalAlign: 'center',
    textAlign: 'center',
    paddingBottom: theme.spacing(1),
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.h5.fontSize,
    margin: theme.spacing(6, 0, 1),
    lineHeight: 1.4,
  },
  sectionHeaderLinks: {
    display: 'flex',
    justifyContent: 'right',
    verticalAlign: 'center',
    fontSize: theme.typography.body2.fontSize,
  },
  sectionHeaderLink: {
    color: theme.palette.primary.main,
    fontSize: theme.typography.body2.fontSize,
    lineHeight: 1.5,
    fontWeight: theme.typography.fontWeightMedium,
    transition: theme.transitions.create('color'),
    '&:hover': {
      textDecoration: 'none',
      color: theme.palette.primary.main,
    },
    cursor: 'pointer',
  },
  sectionHeaderLabel: {
    padding: theme.spacing(0, 0.75),
    fontSize: theme.typography.body2.fontSize,
    lineHeight: '1.25rem',
    backgroundColor: theme.palette.neutralShades[200],
    borderRadius: theme.shape.borderRadius,
    marginLeft: theme.spacing(1.5),
  },
  tokenizeInfoContainer: {
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.primaryShades[100],
    color: theme.palette.neutralShades[800],
    padding: theme.spacing(2),
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(-4),
    textAlign: 'center',
  },
  tokenizeImage: {
    height: '225px',
    margin: theme.spacing(-5),
  },
  tokenizeWarningContainer: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.warningShades[100],
    padding: theme.spacing(0.5),
  },
  badgeCount: {
    color: theme.palette.wallet.text.primary,
    marginLeft: theme.spacing(1),
  },
  badgeHeader: {
    margin: theme.spacing(6, 0, 2),
  },
  infoIcon: {
    marginLeft: theme.spacing(1),
    color: theme.palette.neutralShades[400],
    width: '20px',
    height: '20px',
  },
  infoIconDark: {
    marginLeft: theme.spacing(1),
    color: theme.palette.wallet.text.primary,
    width: '20px',
    height: '20px',
  },
  contentCopyIconButton: {
    color: theme.palette.neutralShades[600],
    paddingTop: theme.spacing(0.5),
    cursor: 'pointer',
  },
  domainNameBox: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    [theme.breakpoints.up('md')]: {
      justifyContent: 'initial',
    },
  },
  domainName: {
    justifyContent: 'center',
    fontSize: '1.75rem',
    lineHeight: 1.4,
    color: theme.palette.neutralShades[500],
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
  riskScoreLogo: {
    width: '25px',
    height: '25px',
    marginRight: theme.spacing(1.5),
    cursor: 'pointer',
  },
  riskScoreIcon: {
    width: '15px',
    height: '15px',
  },
  riskScoreShareIcon: {
    width: '18px',
    height: '18px',
  },
  riskScoreShareButton: {
    marginLeft: theme.spacing(0.25),
  },
  emailAndLocation: {
    fontSize: theme.typography.body1.fontSize,
    lineHeight: 1.5,
    fontWeight: theme.typography.fontWeightMedium,
    marginRight: theme.spacing(1),
  },
  reverseResolutionProfileLink: {
    color: theme.palette.getContrastText(theme.palette.neutralShades[600]),
    transition: theme.transitions.create('color'),
    fontWeight: 'bold',
    fontSize: theme.typography.body2.fontSize,
    '&:hover': {
      textDecoration: 'none',
      color: theme.palette.neutralShades[200],
    },
    marginRight: theme.spacing(1),
    cursor: 'pointer',
  },
  websiteLink: {
    color: theme.palette.greyShades[600],
    transition: theme.transitions.create('color'),
    fontWeight: 'normal',
    '&:hover': {
      textDecoration: 'none',
      color: theme.palette.primary.main,
    },
  },
  divider: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  loginContainer: {
    display: 'flex',
  },
  searchContainer: {
    display: 'flex',
    zIndex: 102,
    flexDirection: 'column',
    maxWidth: '512px',
    width: '100%',
    marginRight: '2em',
    [theme.breakpoints.down('md')]: {
      maxWidth: '20em',
    },
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  topHeaderContainer: {
    position: 'absolute',
    right: theme.spacing(2),
    top: theme.spacing(1),
    display: 'flex',
    zIndex: 102,
    [theme.breakpoints.up('sm')]: {
      width: 'calc(100% - 347px)',
    },
    justifyContent: 'space-between',
  },
  chatContainer: {
    marginRight: theme.spacing(0),
  },
  menuButtonContainer: {
    display: 'flex',
    marginTop: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      justifyContent: 'center',
    },
  },
  followCount: {
    color: theme.palette.neutralShades[600],
    cursor: 'pointer',
    marginRight: theme.spacing(1),
  },
  description: {
    fontSize: theme.typography.body2.fontSize,
    lineHeight: 1.5,
    marginBottom: theme.spacing(2),
  },
  empty: {
    padding: theme.spacing(15, 0),
    textAlign: 'center',
    color: theme.palette.neutralShades[600],
    fontSize: theme.typography.h5.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    display: 'flex',
    alignItems: 'center',
    flexFlow: 'column',
    maxWidth: 300,
    margin: '0 auto',
  },
  emptyIcon: {
    marginBottom: theme.spacing(2),
    fontSize: 48,
  },
  humanityVerifiedLink: {
    color: theme.palette.successShades[700],
    fontSize: theme.typography.body1.fontSize,
    lineHeight: 1.5,
    fontWeight: theme.typography.fontWeightMedium,
    marginBottom: theme.spacing(2),
    display: 'flex',
    '&:hover': {
      textDecoration: 'none',
    },
    [theme.breakpoints.up('md')]: {
      justifyContent: 'initial',
    },
  },
  humanityVerifiedIcon: {
    marginRight: theme.spacing(1.5),
  },
  humanityVerifiedTooltipContent: {
    textAlign: 'center',
    fontSize: theme.typography.caption.fontSize,
    maxWidth: 220,
  },
  featuredTooltipLink: {
    fontSize: 'inherit',
    color: theme.palette.greyShades[200],
  },
  featuredContentHidden: {
    color: theme.palette.greyShades[400],
  },
  socialContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    [theme.breakpoints.down('md')]: {
      alignItems: 'center',
    },
  },
  otherDomainsLabel: {
    cursor: 'pointer',
  },
  ownerAddressLabel: {
    cursor: 'pointer',
  },
  footer: {
    ...theme.containers.main,
    maxWidth: 1256,
    padding: theme.spacing(0, 2.5),
    [theme.breakpoints.down('md')]: {
      margin: 0,
    },
  },
  unstoppableLogo: {
    fontSize: 64,
    marginBottom: theme.spacing(3),
  },
}));
