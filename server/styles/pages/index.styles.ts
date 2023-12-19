import type {Theme} from '@mui/material/styles';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

export const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    background: theme.palette.neutralShades[100],
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    paddingBottom: theme.spacing(16),
    height: '100%',
    justifyContent: 'center',
  },
  content: {
    ...theme.containers.main,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  item: {
    justifyContent: 'center',
    display: 'flex',
  },
  searchContainer: {
    display: 'flex',
    zIndex: 102,
    flexDirection: 'column',
    maxWidth: '650px',
    width: '100%',
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
  sectionTitle: {
    fontSize: 60,
    lineHeight: '64px',
    fontFamily: "'Helvetica Neue', sans-serif",
    fontWeight: 900,
    textAlign: 'center',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(7),
    [theme.breakpoints.down('sm')]: {
      marginBottom: theme.spacing(4),
      fontSize: 32,
      lineHeight: '40px',
    },
  },
  sectionSubTitle: {
    fontSize: 22,
    lineHeight: '36px',
    textAlign: 'center',
    color: theme.palette.neutralShades[600],
    marginBottom: theme.spacing(7),
    marginTop: theme.spacing(-4),
    [theme.breakpoints.down('sm')]: {
      fontSize: 18,
      lineHeight: '24px',
      marginBottom: theme.spacing(4),
      marginTop: theme.spacing(-2),
    },
  },
  footer: {
    ...theme.containers.main,
    maxWidth: 1256,
    padding: theme.spacing(0, 2.5),
  },
}));
