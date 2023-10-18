import type {Theme} from '@mui/material/styles';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  dialogRoot: {
    margin: 0,
    [theme.breakpoints.down('sm')]: {
      margin: theme.spacing(1),
    },
  },
  modalContent: {
    backgroundColor: 'rgba(17, 51, 83, 0.02)',
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    minWidth: 420,
    [theme.breakpoints.down('sm')]: {
      minWidth: 300,
      padding: theme.spacing(1.5),
    },
  },
  contentContainerNoPadding: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(2),
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
}));
// TODO jss-to-tss-react codemod: usages of this hook outside of this file will not be converted.
export default useStyles;
