import type {Theme} from '@mui/material/styles';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    ...theme.containers.main,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  title: {
    fontWeight: theme.typography.fontWeightBold,
  },
  bold: {
    fontWeight: theme.typography.fontWeightBold,
  },
  primaryContainer: {
    ...theme.containers.panel,
    width: '100%',
    margin: theme.spacing(4, 0),
    padding: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      marginTop: 0,
    },
  },
  walletsHeader: {
    display: 'flex',
    alignItem: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      flexWrap: 'wrap',
    },
  },
  linkWalletButton: {
    width: 'fit-content',
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(1),
      width: '100%',
    },
  },
  methodsContainer: {
    display: 'flex',
    height: 192,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  flexColumn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    width: '100%',
  },
  backButtonContainer: {
    height: 48,
    marginTop: theme.spacing(2),
    width: '100%',
  },
  DivStyle: {
    display: 'flex',
    justifyContent: 'center',
  },
  accessWalletContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '30em',
    width: '100%',
  },
  confirmButtonContainer: {
    marginTop: theme.spacing(2),
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
    maxWidth: '100%',
  },
  walletsLoadingContainer: {
    height: '7em',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  marginTop: {
    marginTop: '1em',
  },
  gridItem: {
    minHeight: '19em',
  },
  extra: {
    marginTop: theme.spacing(2),
  },
  // AccessWallet
  root: {
    ...theme.containers.modalContent,
    display: 'flex',
    justifyContent: 'center',
    height: '100%',
  },
  column: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    maxWidth: '500px',
    width: '100%',
    height: '100%',
  },
  prompt: {
    overflowWrap: 'break-word',
    width: '100%',
    margin: '1em',
  },
  error: {
    marginTop: theme.spacing(2),
    overflowWrap: 'break-word',
    textAlign: 'center',
    fontWeight: theme.typography.fontWeightBold,
  },
  ethWalletAddress: {
    fontWeight: 'bold',
    wordBreak: 'break-word',
  },
  modalRoot: {
    left: '0 !important',
    bottom: '0 !important',
    [theme.breakpoints.down('sm')]: {
      maxWidth: 'calc(100vw)',
    },
  },
  modalFullScreen: {
    '& .MuiDialog-container .MuiDialog-paper': {
      margin: 0,
      width: '100%',
    },
  },
  modalHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1.5),
    paddingLeft: theme.spacing(3),
  },
  modalTitle: {
    fontSize: theme.typography.h6.fontSize,
    fontWeight: theme.typography.fontWeightBold,
  },
  modalContent: {
    padding: theme.spacing(3),
    paddingTop: 0,
    height: '100%',
  },
  udConfigContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '505px',
    minHeight: '485px',
    height: '100%',
    [theme.breakpoints.down('sm')]: {
      maxWidth: 'calc(100vw)',
    },
  },
}));

export default useStyles;
