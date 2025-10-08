import type {Theme} from '@mui/material/styles';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  dialogContainer: {
    backgroundColor: theme.palette.common.black,
    width: '961px',
    display: 'flex',
    alignItems: 'flex-start',
    padding: '40px',
    overflowY: 'unset',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      maxHeight: '100%',
      maxWidth: '100%',
      alignItems: 'center',
    },
  },
  modalIcon: {
    padding: '24px 80px',
    gap: '10px',
    width: '360px',
    height: '376px',
    fontSize: 64,
    '& > svg': {
      fontSize: 64,
    },
    background: ' rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    [theme.breakpoints.between('sm', 'md')]: {
      maxWidth: '300px',
    },
    [theme.breakpoints.down('sm')]: {
      maxWidth: 'inherit',
    },
  },
  modalDescription: {
    color: '#fff',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  modalIconWithCircle: {
    height: 'auto',
    maxWidth: '100%',
    border: `1px solid ${theme.palette.neutralShades[200]}`,
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: theme.spacing(1),
  },
  pointer: {
    cursor: 'pointer',
  },
  hoverHighlight: {
    '&:hover': {
      color: theme.palette.primaryShades[500],
    },
  },
  closeIconSection: {
    padding: 0,
    [theme.breakpoints.up('sm')]: {
      display: 'flex',
      justifyContent: 'flex-end',
    },

    [theme.breakpoints.only('xs')]: {
      position: 'absolute',
      top: '5vw',
      left: '80vw',
    },
  },

  closeIcon: {
    margin: 0,
    color: '#fff',
  },

  closeButton: {
    padding: 0,
    margin: 0,
  },
  modalTitle: {
    color: '#fff',
  },
  title: {
    paddingLeft: 0,
    paddingTop: 0,
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    [theme.breakpoints.down('sm')]: {
      maxWidth: '100%',
      padding: '20px',
    },
  },
  modalSubTitle: {
    fontSize: theme.typography.subtitle1.fontSize,
    color: 'rgba(255, 255, 255, 0.72)',
    fontWeight: theme.typography.fontWeightRegular,
    margin: theme.spacing(2, 0, 2),
    textAlign: 'start',
    [theme.breakpoints.down('sm')]: {
      fontSize: '16px',
    },
  },
  holderTitle: {
    marginTop: '8px',
    marginBottom: '8px',
    color: '#fff',
    fontWeight: '700',
    fontSize: '18px',
    lineHeight: '24px',
  },
  modalUsageText: {
    display: 'flex',
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.neutralShades[600],
    fontWeight: theme.typography.fontWeightLight,
    textAlign: 'center',
    alignItems: 'center',
    verticalAlign: 'center',
    marginBottom: theme.spacing(2),
  },
  modalRankText: {
    display: 'flex',
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.neutralShades[600],
    fontWeight: theme.typography.fontWeightLight,
    textAlign: 'center',
    alignItems: 'center',
    verticalAlign: 'center',
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(-1),
  },
  remainingHolders: {
    marginLeft: theme.spacing(0.5),
    fontWeight: '600',
    color: '#fff',
  },
  descriptionLink: {
    fontWeight: 'bold',
    color: '#fff',
    textDecoration: 'none',
  },

  buttonsSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'left',
    height: '40px',
  },
  learnMoreButton: {
    color: '#fff',
    borderColor: '#fff',
    '&:hover': {
      borderColor: '#fff',
    },
    marginRight: theme.spacing(1),
  },
  iconContainer: {
    marginLeft: theme.spacing(-1),
  },
  icons: {
    color: '#fff',
    borderRadius: '50px',
    border: '1px solid white',
    width: '40px',
    height: '40px',
    padding: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  '&.MuiPopover-root': {
    width: '275px',
    height: '100px',
  },
  popOverContainer: {
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    '&:hover': {
      textDecoration: 'unset',
      color: theme.palette.primary.main,
    },
  },
  popOver: {
    width: '275px',
    padding: '8px',
    '&:hover': {
      cursor: 'pointer',
    },
  },

  linkIcon: {
    marginRight: '14px',
    textDecoration: 'unset',
    color: '#000',
  },
  copyLink: {
    display: 'flex',
    alignContent: 'center',
    marginLeft: '14px',
    color: '#000',
    fontWeight: '600',
  },
  sponsorSection: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  sponsor: {
    fontSize: '16px',
    color: theme.palette.neutralShades[400],
    marginRight: '6px',
  },
  sponsorInfoIcon: {
    color: theme.palette.neutralShades[400],
    marginLeft: theme.spacing(1),
  },
  sponsorName: {
    color: '#fff',
    fontWeight: '600',
  },
  domainPreview: {
    marginRight: theme.spacing(-1),
  },
  holdersRemaining: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.getContrastText(theme.palette.secondary.main),
    border: '2px solid white',
  },
}));

export default useStyles;
