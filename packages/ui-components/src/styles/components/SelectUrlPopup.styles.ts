import type {Theme} from '@mui/material/styles';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  dialogRoot: {
    width: '100%',
    maxWidth: 420,
    paddingBottom: 0,
  },
  dialogHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(3),
    paddingBottom: 0,
    fontSize: '1.5rem',
    lineHeight: '1.75rem',
    fontWeight: theme.typography.fontWeightBold,
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
      paddingBottom: 0,
    },
  },
  dialogSubheader: {
    width: '100%',
    lineHeight: '1.25rem',
    padding: theme.spacing(0, 0, 2),
    color: theme.palette.greyShades[600],
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1, 2),
    },
  },
  dialogContent: {
    maxHeight: 450,
    padding: theme.spacing(3, 3, 4),
  },
  dialogConfirmButton: {
    width: '100%',
    paddingTop: theme.spacing(1.25),
    paddingBottom: theme.spacing(1.25),
  },
  dialogActions: {
    padding: theme.spacing(3),
  },
  description: {
    marginBottom: theme.spacing(1),
  },
  imagePreviewContainer: {
    display: 'flex',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePreview: {
    width: '200px',
    height: '200px',
    borderRadius: '50%',
  },
}));

// TODO jss-to-tss-react codemod: usages of this hook outside of this file will not be converted.
export default useStyles;
