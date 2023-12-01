import type {Theme} from '@mui/material/styles';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

const useStyles = makeStyles<void, 'error'>()(
  (theme: Theme, _params, classes) => ({
    // Input
    formMargin: {
      marginTop: theme.spacing(2),
      '&:first-of-type': {
        marginTop: 0,
      },
    },
    formLabel: {
      fontSize: '1.125rem',
      pointerEvents: 'auto', // to make the Tooltip component work inside the InputLabel
      color: theme.palette.greyShades[900],
      fontWeight: theme.typography.fontWeightMedium,
    },
    labelIcon: {
      display: 'flex',
      marginRight: theme.spacing(1.5),
    },
    formControlInputLabel: {
      width: 'inherit',
      maxWidth: 'inherit',
      position: 'initial',
      transform: 'initial',
      fontSize: theme.typography.body1.fontSize,
    },
    error: {borderRadius: theme.shape.borderRadius, border: '1px solid red'},
    inputRoot: {
      width: '100%',
      padding: 0,
      'label + &': {
        marginTop: theme.spacing(3),
      },
    },
    multiChainInputRoot: {
      marginTop: theme.spacing(1),
      'label + &': {
        marginTop: theme.spacing(3),
      },
      border: '1px solid #ced4da',
      '&:focus': {
        borderRadius: theme.shape.borderRadius,
        borderColor: '#80bdff',
      },
      width: '100%',
      borderRadius: theme.shape.borderRadius,
      [`&.${classes.error}`]: {
        borderRadius: theme.shape.borderRadius,
        borderColor: 'red',
      },
      '& input': {
        borderRadius: theme.shape.borderRadius,
        position: 'relative',
        backgroundColor: theme.palette.common.white,
        fontSize: 16,
        width: '100%',
        padding: theme.spacing(1, 1.5),
        transition: theme.transitions.create('border-color'),
        height: '24px',
      },
      '& .MuiOutlinedInput-notchedOutline': {
        display: 'none',
      },
    },
    input: {
      position: 'relative',
      backgroundColor: theme.palette.common.white,
      width: '100%',
      transition: theme.transitions.create('border-color'),
      height: 24,
      padding: theme.spacing(1.25, 1.5),
    },
    labelAndIconDiv: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        height: 42,
      },
    },
    labelGridItem: {
      marginBottom: theme.spacing(1),
      [theme.breakpoints.up('sm')]: {
        marginBottom: 0,
      },
    },
    versionTag: {
      minWidth: '3em',
    },
    formErrorContainer: {
      marginTop: theme.spacing(1),
    },
    // Loading
    loadingContainer: {
      ...theme.containers.main,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '42vh',
      marginBottom: theme.spacing(28),
    },
    loadingText: {
      textAlign: 'center',
      fontWeight: 600,
      marginBottom: theme.spacing(3),
    },
    card: {
      zIndex: 2,
      position: 'absolute',
      width: '80px',
      right: '0.2em',
      textAlign: 'left',
      padding: '10px',
      paddingBottom: '10px',
      boxShadow:
        '0px 0px 4px rgba(0, 0, 0, 0.08), 0px 8px 48px rgba(0, 0, 0, 0.08)',
      [theme.breakpoints.down('sm')]: {
        right: '0em',
      },
      minWidth: '200px',
    },
    visibilityBtn: {
      borderRadius: '20px',
      borderColor: theme.palette.neutralShades[400],
      color: theme.palette.common.black,
      fontSize: '14px',
    },
    cardBtnContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      whiteSpace: 'normal',
      padding: '0px',
      position: 'relative',
      [theme.breakpoints.down('sm')]: {
        left: '0px',
      },
    },
    cardModalButtons: {
      display: 'flex',
      alignItems: 'center',
    },
    visibleBtn: {
      marginLeft: '0px !important',
    },
    cardTitle: {
      fontSize: '16px',
      color: '#000000',
      fontWeight: 700,
      marginBottom: '0px',
    },
    checkIcon: {
      color: theme.palette.primary.main,
    },
    cardCaption: {
      fontSize: '16px',
      fontWeight: 600,
      marginLeft: '6px',
    },
    iconButton: {
      color: '#000000',
    },
  }),
);

// TODO jss-to-tss-react codemod: usages of this hook outside of this file will not be converted.
export default useStyles;
