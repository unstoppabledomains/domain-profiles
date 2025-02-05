import type {Theme} from '@mui/material/styles';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  dialogRoot: {
    margin: 0,
  },
  modalContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    minWidth: 420,
    [theme.breakpoints.down('sm')]: {
      minWidth: '348px',
      padding: theme.spacing(1.5),
    },
    overflow: 'hidden',
    height: '100%',
  },
  modalContentNoMargin: {
    margin: 0,
    padding: 0,
    [theme.breakpoints.down('sm')]: {
      padding: 0,
    },
  },
  contentContainerNoPadding: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    padding: 0,
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(2),
    height: '100%',
  },
  modalHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  modalHeaderPadding: {
    paddingLeft: theme.spacing(2),
  },
  centerHeader: {
    alignItems: 'center !important',
  },
  bold: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  fullScreen: {
    '& .MuiDialog-container .MuiDialog-paper': {
      margin: 0,
      width: '100%',
    },
  },
  titleStyle: {
    color: 'inherit',
    alignSelf: 'center',
  },
}));
export default useStyles;
