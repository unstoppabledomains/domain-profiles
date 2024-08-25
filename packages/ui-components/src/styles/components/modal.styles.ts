import type {Theme} from '@mui/material/styles';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  dialogRoot: {
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'rgba(17, 51, 83, 0.02)',
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
  contentContainerNoPadding: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
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
}));
export default useStyles;
